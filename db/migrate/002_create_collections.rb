class CreateCollections < ActiveRecord::Migration
  def self.up
    create_table :photo_collections do |table|
      table.column :name, :string
      table.column :path, :string
      table.column :url, :string
    end
  end

  def self.down
    drop_table :photo_collections
  end
end
  