import { LucideIcon } from 'lucide-react';

export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  level: 1 | 2 | 3;
  duration: string;
  items: string[];
  isComingSoon?: boolean;
  requiredItems?: string[];
  objectives?: string[];
  thumbnailUrl?: string;
}

export interface LearningCategory {
  id: string;
  title: string;
  description: string;
  path: string;
  topics: LearningTopic[];
} 