# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper  
  def photo_url(photo)
    url_for(:action => :index,:controller => :photos) + '/' + photo.url + '/'
  end
  
  def collection_url(collection)
    url_for(:action => :index,:controller => :photos) + '/' + collection.url + '/'
  end
end
