import { ReactNode } from 'react';

// 既存のコードに追加
export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_url: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievements?: Achievement;
}

export type LearningProgress = {
  id: string;
  user_id: string;
  subject: string;
  progress: number;
  created_at: string;
  completed: boolean;
};

export type SubjectProgressType = {
  subject: string;
  progress: number;
  color: string;
  icon: ReactNode;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: string;
};

export type ReportData = {
  userId: string;
  childId?: string;
  stats: {
    total_points: number;
    total_study_time: number;
    last_week_study_time: number;
    next_badge_progress: number;
  };
  progress: SubjectProgressType[];
  achievements: {
    id: string;
    achievement_id: string;
    earned_at: string;
    achievements?: {
      title: string;
      icon_url: string;
    };
  }[];
  streak: {
    current_streak: number;
    longest_streak: number;
  } | null;
};

export type SELQuest = {
  id: string;
  title: string;
  description: string;
  created_at: string;
};

export interface SELResponse {
  id: string;
  user_id: string;
  emotion: string;
  intensity: number;
  quest_id: string;
  created_at: string;
  note?: string;
  sel_feedback?: {
    id: string;
    feedback_text: string;
    created_at: string;
  }[];
}

export type SELFeedback = {
  id: string;
  response_id: string;
  feedback_text: string;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  username: string;
  email?: string;
  role: 'parent' | 'child';
  birthday?: string;
  parent_id?: string;
  child_number?: number;
  created_at?: string;
  updated_at?: string;
};

export interface UserLearningActivity {
  activity_type: 'achievement' | 'sel_response';
  activity_date: string;
  activity_description: string;
  icon_url?: string;
}

export interface UserLearningProgress {
  total_points: number;
  total_study_time: number;
  current_streak: number;
  longest_streak: number;
  total_achievements: number;
  total_sel_responses: number;
  recent_activities: UserLearningActivity[];
}