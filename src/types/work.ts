export interface Work {
  id: string;
  title: string;
  description?: string;
  media_url: string;
  content_url?: string;
  media_type: 'image' | 'video';
  type: 'drawing' | 'audio' | 'photo';
  thumbnail_url?: string;
  user_id: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  badges?: Badge[];
  rating?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon?: string;
} 