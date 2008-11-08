#TO DO
#build in last_modified column
# - when doing Photo.update check against it
# - if modified, destroy existing, then rebuild


class Photo < ActiveRecord::Base
  after_create :add_exif_data, :set_url, :set_src, :add_tags
  
  acts_as_list :scope => :photo_collection
  
  belongs_to :photo_collection
  has_many :photo_taggings, :dependent => :destroy
  has_many :photo_tags, :through => :photo_taggings
  
  def self.clear_cache
    @@all_paths_in_database = nil
    @@all_paths_in_filesystem = nil
  end
  clear_cache
  
  def self.photos_root_list
    Dir[PHOTOS_ROOT + '/**/*.jpg'].reject{|item| item.match(LARGE_IMAGE_PATTERN)}
  end
  
  #returns an array of the paths of photos stored in the database 
  def self.all_paths_in_database
    return @@all_paths_in_database if !@@all_paths_in_database.nil?
    @@all_paths_in_database = Photo.find(:all).collect{|photo| photo.path.gsub(/\.[^\.]{1,4}$/,'')}
  end
  
  #returns an array of the paths of photos stored in the filesystem
  def self.all_paths_in_filesystem
    return @@all_paths_in_filesystem if !@@all_paths_in_filesystem.nil?
    @@all_paths_in_filesystem = Photo.photos_root_list.collect{|file| file.gsub(PHOTOS_ROOT + '/','').gsub(/\.[^\.]{1,4}$/,'')}
  end
  
  #returns {:add => [filelist], :remove => [filelist]}
  #of files that need to be added or remove from the database 
  def self.scan
    to_add = []
    to_remove = []
    
    Photo.all_paths_in_filesystem.each do |path_in_filesystem|
      to_add.push(path_in_filesystem) if !Photo.all_paths_in_database.select{|path_in_database| path_in_database == path_in_filesystem}[0]
    end
    
    Photo.all_paths_in_database.each do |path_in_database|
      to_remove.push(path_in_database) if !Photo.all_paths_in_filesystem.select{|path_in_filesystem| path_in_filesystem == path_in_database}[0]
    end
    
    {
      :add => to_add,
      :remove => to_remove
    }
  end

  #adds or removes photos based on the results of scan
  #this also triggers Collection to update
  #returns Photo.scan results
  def self.update
    actions = Photo.scan
    
    actions[:add].each do |path|
      Photo.create :path => path
    end
    
    actions[:remove].each do |path|
      Photo.find_all_by_path(path).each(&:destroy)
    end
    
    Photo.clear_cache
    
    PhotoCollection.clear_cache
    PhotoCollection.update
    
    actions
  end
  
  #returns the title, if the title is just a digit it becomes "collection.name #title" (Landscape #5)
  def name
    (self.title.match(/^[\d]+$/) ? self.collecton.name + ' #' + self.title : self.title).gsub(/[\-_]+/,' ')
  end
  
  #produces alt text in this format
  #name (tag 1, tag 2, tag 3): Caption - Location
  def alt
    output = self.name
    tags_str = self.photo_tags.collect(&:tag).join(', ')
    output += ' (' + tags_str.strip + ')' if tags_str != ''
    output += tags_str == '' ? self.caption : ': ' + self.caption if self.caption && self.caption != ''
    output += ' - ' + self.location if self.location && self.location != ''
    output
  end
  
  #full path to the source image file
  def source_path
    return @source_path if !@source_path.nil?
    @source_path = Photo.photos_root_list.find{|path| path[self.path]}
  end
  
  def set_src
    update_attribute :src, '/photos/' + self.id.to_s + '-' + self.title.downcase.underscore.gsub(/\s/,'_') + '.' + source_path.split('.').pop
  end
    
  def add_exif_data
    path_to_file = source_path
    exif = EXIFData.new(MiniExiftool.new(path_to_file),logger)
    [:focal_length,:iso,:shutter_speed,:f_stop,:camera,:caption,:location].each do |key|
      self.send(key.to_s + '=',exif[key] || nil)
    end
    
    #date,title,lens and tags are special cases
    if exif[:date].is_a? Time
      self.date = exif[:date]
    else
      date_match = (exif[:date] || '').match(/([\d]+):([\d]+):([\d]+) ([\d]+):([\d]+):([\d]+)/)
      self.date = Time.mktime(date_match[1],date_match[2],date_match[3],date_match[4],date_match[5],date_match[6]) if date_match
    end
    self.title = exif[:title] || source_path.split('/').pop.gsub(/\.[a-zA-Z]{1,4}/,'')
    self.lens = exif[:lens] ? (LENS_TRANSLATIONS[exif[:lens]] ? LENS_TRANSLATIONS[exif[:lens]] : exif[:lens]) : nil
    @tags = exif[:tags] || []
  end
  
  def add_tags
    @tags.each do |str|
      self.photo_taggings.create({
        :photo_tag_id => (PhotoTag.find_by_tag(str) || PhotoTag.create(:tag => str)).id,
        :photo_id => self.id
      })
    end
  end
  
  def set_url
    path_components = self.path.underscore.gsub(/\s/,'_').split('/')
    path_components[path_components.length - 1].replace(self.id.to_s + '-' + path_components[path_components.length - 1])
    update_attribute :url, path_components.join('/')
  end
  
  class EXIFData
    EXIF_TRANSLATIONS = {
      :title => ['Title','ObjectName'],
      :focal_length => ['FocalLength'],
      :iso => ['ISO'],
      :shutter_speed => ['ShutterSpeedValue'],
      :f_stop => ['ApertureValue'],
      :lens => ['Lens','LensType'],
      :camera => ['Model'],
      :date => ['DateTimeOriginal'],
      :caption => ['Description','ImageDescription','Caption-Abstract'],
      :tags => ['Keywords','Subject'],
      :location => ['Location'],
    }
    
    EXIF_TRANSFORMATIONS = {
      #:date => lambda{|exif_value| exif_value.to_s.split('-').shift},
      :shutter_speed => lambda{|exif_value| exif_value.to_s.gsub(/1\//,'')},
      :focal_length => lambda{|exif_value| exif_value.to_s.gsub(/\.([\d]{1,})?\s?.+$/,'')},
      :tags => lambda{|exif_value| (exif_value.is_a?(Array) ? exif_value.join(',') : exif_value).gsub(/["']+/,'').gsub(/\s+?,\s+?/,',').split(',').collect(&:strip).collect(&:downcase)}
    }
    
    def initialize(exif_data,logger)
      @exif_data = exif_data
      @logger = logger
    end
    
    def [](key)
      EXIF_TRANSLATIONS[key.to_sym].each do |exif_key_name|
        exif_value = @exif_data[exif_key_name.to_s]
        if !exif_value.nil? && exif_value != false && exif_value != '' && exif_value != 'false' && exif_value != 'nil'
          return EXIF_TRANSFORMATIONS[key] ? EXIF_TRANSFORMATIONS[key].call(exif_value) : exif_value
        end
      end
      false
    end
  end
end