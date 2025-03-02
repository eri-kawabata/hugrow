import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { ReportHeader } from './Report/ReportHeader';
import { StatsSection } from './Report/StatsSection';
import { SubjectsSection } from './Report/SubjectsSection';
import { AchievementSection } from './Report/AchievementSection';
import { GoalsSection } from './Report/GoalsSection';
import { EmotionSection } from './Report/EmotionSection';
import { SELAnalyticsView } from './Report/SELAnalyticsView';
import { LoadingState } from './Report/LoadingState';
import { ErrorState } from './Report/ErrorState';
import { useReportData } from '../hooks/useReportData';
import { useSELResponses } from '../hooks/useSELResponses';
import { useParentMode } from '../hooks/useParentMode';
import { ParentModeToggle } from './ParentMode/ParentModeToggle';
import { ChildSelector } from './ParentMode/ChildSelector';

// パフォーマンス最適化のためのメモ化
const MemoizedStatsSection = React.memo(StatsSection);
const MemoizedSubjectsSection = React.memo(SubjectsSection);
const MemoizedAchievementSection = React.memo(AchievementSection);
const MemoizedEmotionSection = React.memo(EmotionSection);
const MemoizedSELAnalyticsView = React.memo(SELAnalyticsView);

export function Report() {
  const navigate = useNavigate();
  const { data, loading: reportLoading, error: reportError, isAuthenticated } = useReportData();
  const { 
    responses, 
    loading: responsesLoading, 
    error: responsesError,
    fetchResponses 
  } = useSELResponses();
  const { isParentMode, selectedChildId } = useParentMode();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (data?.userId) {
      const targetUserId = isParentMode && selectedChildId ? selectedChildId : data.userId;
      fetchResponses(targetUserId);
    }
  }, [data?.userId, isParentMode, selectedChildId, fetchResponses]);

  if (reportLoading || responsesLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  if (reportError || responsesError) {
    return (
      <Layout>
        <ErrorState 
          message={reportError?.message || responsesError?.message}
          onRetry={async () => {
            if (data?.userId) {
              await fetchResponses(data.userId);
            }
          }}
        />
      </Layout>
    );
  }

  if (!data) {
    return null;
  }

  // Achievement型に合わせてデータを整形
  const achievementsWithFullData = data.achievements.map(achievement => ({
    ...achievement,
    user_id: data.userId,
    achievements: achievement.achievements && {
      ...achievement.achievements,
      id: achievement.achievement_id,
      description: '' // APIから取得するか、別途対応が必要
    }
  }));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <ReportHeader />
          <div className="flex items-center gap-4">
            <ParentModeToggle />
            {isParentMode && <ChildSelector />}
          </div>
        </div>
        
        <div className="space-y-8">
          <MemoizedStatsSection data={data} />
          <MemoizedSubjectsSection progress={data.progress} />
          <MemoizedAchievementSection achievements={achievementsWithFullData} />
          <GoalsSection />
          <MemoizedEmotionSection responses={responses} />
          {isParentMode && (
            <MemoizedSELAnalyticsView responses={responses} />
          )}
        </div>
      </div>
    </Layout>
  );
}