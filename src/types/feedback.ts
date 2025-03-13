export interface Feedback {
  id: string;
  work_id: string;
  user_id: string;
  feedback: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
} 