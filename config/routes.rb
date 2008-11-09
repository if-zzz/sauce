ActionController::Routing::Routes.draw do |map|
  map.connect 'photos', :controller => 'photos', :action => 'index'
  map.connect 'photos/*path', :controller => 'photos', :action => 'photo'
end
