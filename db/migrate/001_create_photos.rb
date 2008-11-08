class CreatePhotos < ActiveRecord::Migration
  def self.up
    create_table :photos do |table|
      table.column :photo_collection_id, :int
      table.column :position, :int
      table.column :path, :string
      table.column :url, :string
      table.column :src, :string
      table.column :title, :string
      table.column :date, :datetime
      table.column :location, :string
      table.column :f_stop, :string
      table.column :shutter_speed, :string
      table.column :focal_length, :string
      table.column :iso, :string
      table.column :camera, :string
      table.column :lens, :string
      table.column :caption, :text
    end
    execute 'ALTER TABLE photos ENGINE = MyISAM'
    execute 'CREATE FULLTEXT INDEX photos_fulltext_index ON photos(caption)'
  end
  
  def self.down
    execute 'ALTER TABLE photos DROP INDEX photos_fulltext_index'
    execute 'ALTER TABLE photos ENGINE = InnoDB'
    drop_table :photos
  end
end
