class UpdateScoreContentToJson < ActiveRecord::Migration[7.0]
  def up
    change_column :scores, :content, :json, using: 'content::json'
  end

  def down
    change_column :scores, :content, :text
  end
end
