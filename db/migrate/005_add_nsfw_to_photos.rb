class AddNsfwToPhotos < ActiveRecord::Migration
  def self.up
    add_column :photos, :nsfw, :int
  end
  
  def self.down
    remove_column :photos, :nsfw
  end
end
