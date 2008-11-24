# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper  
  def photo_url(photo)
    '/photos' + '/' + photo.url + '/'
  end
  
  def collection_url(collection)
    '/photos' + '/' + collection.url + '/'
  end
end
