export interface Work {
  id: string;
  title: string;
  description?: string;
  media_url: string;
  media_type: 'image' | 'video';
  user_id: string;
  created_at: string;
  updated_at: string;
} 