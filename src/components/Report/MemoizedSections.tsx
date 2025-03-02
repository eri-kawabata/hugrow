import { memo } from 'react';
import type { ReportData, SELResponse, SubjectProgressType } from '../../lib/types';
import { StatsSection } from './StatsSection';
import { SubjectsSection } from './SubjectsSection';
import { AchievementSection } from './AchievementSection';
import { EmotionSection } from './EmotionSection';

// 比較関数の抽出と最適化
const areArraysEqual = <T extends { id?: string }>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const aId = item.id || JSON.stringify(item);
    const bId = b[index].id || JSON.stringify(b[index]);
    return aId === bId;
  });
};

const areStatsEqual = (prev: ReportData | null, next: ReportData | null) => {
  if (!prev || !next) return prev === next;
  return (
    prev.stats.total_points === next.stats.total_points &&
    prev.stats.total_study_time === next.stats.total_study_time &&
    prev.streak?.current_streak === next.streak?.current_streak
  );
};

export const MemoizedStatsSection = memo(StatsSection, 
  (prev, next) => areStatsEqual(prev.data, next.data)
);

export const MemoizedSubjectsSection = memo(SubjectsSection, 
  (prev, next) => areArraysEqual(prev.progress, next.progress)
);

export const MemoizedAchievementSection = memo(AchievementSection,
  (prev, next) => areArraysEqual(prev.achievements, next.achievements)
);

export const MemoizedEmotionSection = memo(EmotionSection,
  (prev, next) => areArraysEqual(prev.responses, next.responses)
); 