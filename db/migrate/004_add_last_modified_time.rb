class AddLastModifiedTime < ActiveRecord::Migration
  def self.up
    add_column :photos, :last_modified, :datetime
  end
  
  def self.down
    remove_column :photos, :last_modified
  end
end
