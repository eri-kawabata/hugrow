-- インデックスの追加
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_sel_responses_user_id ON sel_responses(user_id);
CREATE INDEX idx_learning_stats_user_id ON learning_stats(user_id);

-- パーティショニングの導入
ALTER TABLE sel_responses 
  PARTITION BY RANGE (created_at);

CREATE TABLE sel_responses_current PARTITION OF sel_responses
  FOR VALUES FROM ('2024-01-01') TO ('2024-12-31'); 