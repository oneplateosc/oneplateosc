class Score < ApplicationRecord
  belongs_to :user
  validates :title, presence: true
  validates :artist, presence: true

  # JSONデータをハッシュとして扱うためのメソッド
  def content_hash
    JSON.parse(content) rescue {}
  end

  # ハッシュデータをJSONとして保存するためのメソッド
  def content_hash=(hash)
    self.content = hash.to_json
  end
end
