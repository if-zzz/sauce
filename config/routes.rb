ActionController::Routing::Routes.draw do |map|
  map.root :controller => 'photos', :action => 'index'
  map.connect 'photos', :controller => 'photos', :action => 'index'
  map.connect 'photos/clear_all_cached_pages', :controller => 'photos', :action => 'clear_all_cached_pages'
  map.connect 'photos/*path', :controller => 'photos', :action => 'photo'
end
