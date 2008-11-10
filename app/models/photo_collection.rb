class PhotoCollection < ActiveRecord::Base
  has_many :photos, :include => [:photo_tags,:photo_collection]
  after_create :set_photos_collection_ids, :set_name
  before_create :generate_url
  
  def self.clear_cache
    @@all_urls = nil
    @@all_options = nil
  end
  clear_cache
    
  def self.update
    collection_paths_in_database = PhotoCollection.find(:all).collect(&:path)
    
    collection_paths_in_filesystem = []
    Photo.all_paths_in_database.each do |path|
      collection = path.gsub(/\/[^\/]+$/,'')
      collection_bits = collection.split('/')
      collection_bits.each_with_index do |part,i|
        joined = collection_bits[0,i].join('/')
        collection_paths_in_filesystem.push(joined) if !collection_paths_in_filesystem.include?(joined) && joined != ''
      end
      collection_paths_in_filesystem.push(collection) if !collection_paths_in_filesystem.include? collection
    end
    
    to_add = []
    to_remove = []
    
    collection_paths_in_filesystem.each do |path_in_filesystem|
      to_add.push(path_in_filesystem) if !collection_paths_in_database.include? path_in_filesystem
    end
    
    collection_paths_in_database.each do |path_in_database|
      to_remove.push(path_in_database) if !collection_paths_in_filesystem.include? path_in_database
    end
    
    to_add.each do |path|
      PhotoCollection.create :path => path
    end
    
    to_remove.each do |path|
      PhotoCollection.find_by_path(path).destroy
    end
  end
    
  #returns an array of all the available urls, "America/New York" becomes => "america/new_york"
  def self.all_urls
    return @@all_urls if !@@all_urls.nil?
    @@all_urls = PhotoCollection.find(:all).collect(&:url)
  end
  
  #returns a sanitized array of url => title collection pairs
  def self.all_options
    return @@all_options if !@@all_options.nil?
    @@all_options = PhotoCollection.all_urls.zip(PhotoCollection.find(:all).collect(&:name))
  end
  
  def generate_url
    self.url = self.path.underscore.gsub(/\s/,'_')
  end
  
  def set_photos_collection_ids
    Photo.all_paths_in_database.select{|path| self.path.underscore.gsub(/\s/,'_') == path.gsub(/\/[^\/]+$/,'').underscore.gsub(/\s/,'_')}.each do |path|
      Photo.find_by_path(path).update_attribute :photo_collection_id, self.id
    end
  end
  
  def set_name
    update_attribute :name, path.split('/').pop.gsub(/[\_\-]+/,' ').split(/\s+/).each(&:capitalize!).join(' ')
  end
  
  def self.top_level
    PhotoCollection.find(:all).select{|collection| !collection.parent}
  end
    
  def parent
    return @parent if !@parent.nil?
    @parent = self.path.count('/') > 0 ? PhotoCollection.find_by_path(self.path.gsub(/\/[^\/]+$/,'')) : false 
  end
  
  #returns an array of all parents
  def parents
    return @parents if !@parents.nil?
    @parents = []
    path_components = self.path.split('/')
    path_components.each_with_index do |path,i|
      parent_path = path_components[0,i].join('/')
      @parents.push(PhotoCollection.find_by_path(parent_path)) if parent_path != ''
    end
    @parents.reverse!
  end
  
  #returns a Collection array of all children
  def all_children
    return @all_children if !@all_children.nil?
    @all_children = PhotoCollection.all_urls.find_all{|url| url[self.url] && url != self.url}.collect{|url| PhotoCollection.find_by_url(url)}
  end
  
  #returns a Collection array of only the direct children of the collection
  def children
    return @children if !@children.nil?
    @children = all_children.find_all{|collection| collection.url.count('/') == self.url.count('/') + 1}
  end
end