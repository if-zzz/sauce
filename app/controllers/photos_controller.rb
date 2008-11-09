class PhotosController < ApplicationController
  def index
    @collections = PhotoCollection.find(:all).select{|collection| collection.url.count('/') == 0}
  end
  
  def photo
    return collection if !@photo = Photo.find_by_url(params[:path].join('/'),:include => [:photo_tags,:photo_collection])
  end
  
  def collection
    raise UnknownAction if !@collection = PhotoCollection.find_by_url(params[:path].join('/'))
    render :action => :collection
  end
end