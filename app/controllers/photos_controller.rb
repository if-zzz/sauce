class PhotosController < ApplicationController
  caches_page :index, :photo, :collection

  def index
    @collections = PhotoCollection.find(:all).select{|collection| collection.url.count('/') == 0}
  end
  
  def photo
    return collection if !@photo && !@photo = Photo.find_by_url(params[:path].join('/'),:include => [:photo_tags,:photo_collection])
    @collection = @photo.photo_collection
  end
  
  def collection
    raise UnknownAction if !@collection = PhotoCollection.find_by_url(params[:path].join('/'))
    if(@collection_index_partial = collection_index_partial(@collection))
      render :action => :collection
    else
      @photo = @collection.photos.first
      if @photo
        photo
      else
        render :action => :photo_missing
      end
    end
  end
  
  def update
    Photo.update
    expire_page :action => :index
    PhotoCollection.find(:all).each do |collection|
      url = url_for(:action => :index,:controller => :photos) + '/' + collection.url + '/'
      cache_page url
      expire_page 
    end
    Photo.find(:all).each do |photo|
      url = url_for(:action => :index,:controller => :photos) + '/' + photo.url + '/'
      expire_page url
      cache_page url
    end
    
    render :text => 'Cache cleared.'
  end
  
  protected
  
  def collection_index_partial(collection)
    collection_bits = collection.path.split('/')
    collection_bits[collection_bits.length - 1] = '_' + collection_bits[collection_bits.length - 1]
    if File.exists?(RAILS_ROOT + '/app/views/photos/collections/' + collection_bits.join('/') + '.rhtml')
      'photos/collections/' + collection.path
    else
      false
    end
  end
end