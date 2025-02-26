// 既存のコードに追加
export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon_url: string;
  category: 'streak' | 'challenge' | 'skill';
  required_value: number;
  reward_points: number;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
};