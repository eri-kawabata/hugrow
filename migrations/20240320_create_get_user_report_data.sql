CREATE OR REPLACE FUNCTION get_user_report_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    WITH stats AS (
        SELECT 
            total_points,
            total_study_time,
            last_week_study_time,
            next_badge_progress
        FROM learning_stats 
        WHERE user_id = p_user_id
    ),
    progress AS (
        SELECT 
            json_agg(
                json_build_object(
                    'subject', subject,
                    'progress', progress
                )
            ) as subjects
        FROM subject_progress 
        WHERE user_id = p_user_id
    ),
    achievements AS (
        SELECT 
            json_agg(
                json_build_object(
                    'id', ua.id,
                    'achievement_id', ua.achievement_id,
                    'earned_at', ua.earned_at,
                    'achievements', json_build_object(
                        'title', a.title,
                        'icon_url', a.icon_url
                    )
                )
            ) as achievements
        FROM user_achievements ua
        LEFT JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = p_user_id
    ),
    streak AS (
        SELECT 
            current_streak,
            longest_streak
        FROM streaks 
        WHERE user_id = p_user_id
    )
    SELECT 
        json_build_object(
            'stats', row_to_json(stats),
            'progress', COALESCE(progress.subjects, '[]'::json),
            'achievements', COALESCE(achievements.achievements, '[]'::json),
            'streak', row_to_json(streak)
        ) INTO result
    FROM stats
    CROSS JOIN progress
    CROSS JOIN achievements
    CROSS JOIN streak;

    RETURN result;
END;
$$ LANGUAGE plpgsql; 