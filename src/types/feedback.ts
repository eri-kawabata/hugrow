export interface Feedback {
  id: string;
  work_id: string;
  user_id: string;
  feedback: string;
  created_at: string;
  username?: string;
  likes?: number;
  liked_by_me?: boolean;
  isLikeLoading?: boolean;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
    full_name?: string;
    username?: string;
    role?: string;
  };
} 