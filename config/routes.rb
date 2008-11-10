ActionController::Routing::Routes.draw do |map|
  map.connect 'photos', :controller => 'photos', :action => 'index'
  map.connect 'photos/update', :controller => 'photos', :action => 'update'
  map.connect 'photos/*path', :controller => 'photos', :action => 'photo'
end
