require 'net/sftp'
require RAILS_ROOT + '/config/deploy_config.rb'

class SauceDeployer
  def self.deploy
    logger = Logger.new(RAILS_ROOT + '/log/development.log')
    Net::SFTP.start(HOST,USER,:password => PASSWORD) do |sftp|
      sftp.rename(REMOTE_PUBLIC_ROOT,REMOTE_PUBLIC_ROOT + '_backup_' + Time.now.to_i.to_s)
      sftp.upload(RAILS_ROOT + '/public',REMOTE_PUBLIC_ROOT,:requests => 2) do |event, uploader, *args|
        case event
          when :open then
            logger.info "starting upload: #{args[0].local} -> #{args[0].remote} (#{args[0].size} bytes}"
          when :put then
            logger.info "writing #{args[2].length} bytes to #{args[0].remote} starting at #{args[1]}"
          when :close then
            logger.info "finished with #{args[0].remote}"
          when :mkdir then
            logger.info "creating directory #{args[0]}"
          when :finish then
            logger.info "all done!"
        end
      end
    end
  end
  
  def self.cache_all_pages(host = 'localhost:3000')
    page_list.each do |page|
      Net::HTTP.get(URI.parse("http://#{host}/#{page}"))
    end
    self.create_indicies
  end
  
  def self.create_indicies
    Dir[RAILS_ROOT + '/public/**/*.html'].each do |file|
      directory = File.dirname(file) + '/' + File.basename(file,'.html')
      target = File.dirname(file) + '/' + File.basename(file,'.html') + '/index.html'
      File.copy(file,target) if File.exists?(directory) && !File.exists?(target)
    end
  end
  
  protected
  
  def self.page_list
    collection_pages = PhotoCollection.find(:all).collect do |collection|
      'photos/' + collection.url
    end
    photo_pages = Photo.find(:all).collect do |photo|
      'photos/' + photo.url
    end
    ['photos'].concat(collection_pages).concat(photo_pages)
  end
  
end