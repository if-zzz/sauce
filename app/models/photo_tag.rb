class PhotoTag < ActiveRecord::Base
  has_many :photos, :through => :photo_taggings
end