export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'special';
  reward: {
    points: number;
    badge?: string;
  };
  requirements: {
    type: 'count' | 'completion' | 'streak';
    target: number;
    current: number;
  };
}

export interface MissionProgress {
  missionId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
} 