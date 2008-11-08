class PhotoTagging < ActiveRecord::Base
  belongs_to :photo_tag
  belongs_to :photo
end