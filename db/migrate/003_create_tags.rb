class CreateTags < ActiveRecord::Migration
  def self.up
    create_table :photo_tags do |table|
      table.column :tag, :string
    end
    create_table :photo_taggings do |table|
      table.column :photo_tag_id, :int
      table.column :photo_id, :int
    end
  end
  
  def self.down
    drop_table :photo_tags
    drop_table :photo_taggings
  end
end
