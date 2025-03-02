-- 学習進捗の集計ビュー
CREATE VIEW user_learning_summary AS
SELECT 
    u.id as user_id,
    COALESCE(ls.total_points, 0) as total_points,
    COALESCE(ls.total_study_time, 0) as total_study_time,
    COALESCE(s.current_streak, 0) as current_streak,
    COALESCE(s.longest_streak, 0) as longest_streak,
    COUNT(DISTINCT ua.id) as total_achievements,
    COUNT(DISTINCT sr.id) as total_sel_responses
FROM users u
LEFT JOIN learning_stats ls ON u.id = ls.user_id
LEFT JOIN streaks s ON u.id = s.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN sel_responses sr ON u.id = sr.user_id
GROUP BY u.id, ls.total_points, ls.total_study_time, s.current_streak, s.longest_streak;

-- 最近の学習活動ビュー
CREATE VIEW recent_learning_activities AS
SELECT 
    user_id,
    'achievement' as activity_type,
    ua.earned_at as activity_date,
    a.title as activity_description,
    a.icon_url
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
UNION ALL
SELECT 
    user_id,
    'sel_response' as activity_type,
    created_at as activity_date,
    emotion as activity_description,
    NULL as icon_url
FROM sel_responses
ORDER BY activity_date DESC; 