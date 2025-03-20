export type LearningProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string | null;
  metadata: Record<string, any> | null;
  difficulty_level: number;
  started_at: string;
  progress_data: Record<string, any>;
  score: number;
  status: string;
  created_at: string;
  updated_at: string | null;
};

export type ParentChildRelation = {
  id: string;
  parent_id: string;
  child_id: string;
  relationship_type: 'parent' | 'guardian';
  permissions: Record<string, any>;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string | null;
};

export type Profile = {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  role: 'parent' | 'child';
  birthday: string | null;
  parent_id: string | null;
  child_number: number | null;
  settings: Record<string, any> | null;
  last_login_at: string | null;
  bio: string | null;
  preferences: Record<string, any> | null;
  status: string;
  display_name: string | null;
  last_active_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
};

export type Work = {
  id: string;
  user_id: string;
  profile_id: string;
  title: string;
  description?: string;
  type: 'drawing' | 'audio' | 'photo';
  content_url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at?: string;
  status: 'draft' | 'published';
  visibility: 'public' | 'private';
  metadata: Record<string, any>;
};

export type Lesson = {
  id: string;
  subject: 'science' | 'technology' | 'engineering' | 'art' | 'math';
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  duration: number;
  points: number;
  order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string | null;
};

export type LessonStep = {
  id: string;
  lesson_id: string;
  title: string;
  content: string;
  type: 'content' | 'quiz';
  order: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string | null;
};

export type LessonQuiz = {
  id: string;
  step_id: string;
  question: string;
  choices: string[];
  correct_index: number;
  explanation: string | null;
  points: number;
  created_at: string;
  updated_at: string | null;
};

export type QuizResponse = {
  id: string;
  user_id: string;
  quiz_id: string;
  selected_index: number;
  is_correct: boolean;
  time_taken: number;
  created_at: string;
};

export type Reward = {
  id: string;
  user_id: string;
  type: 'lesson_complete' | 'quiz_perfect' | 'streak' | 'achievement';
  points: number;
  metadata: Record<string, any>;
  created_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  requirements: Record<string, any>;
  progress: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export type Ranking = {
  id: string;
  user_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  points: number;
  rank: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string | null;
};

export type Database = {
  learning_progress: LearningProgress;
  parent_child_relations: ParentChildRelation;
  profiles: Profile;
  works: Work;
  lessons: Lesson;
  lesson_steps: LessonStep;
  lesson_quizzes: LessonQuiz;
  quiz_responses: QuizResponse;
  rewards: Reward;
  achievements: Achievement;
  rankings: Ranking;
}; 