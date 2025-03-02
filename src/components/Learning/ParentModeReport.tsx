import { LearningLayout } from '../LearningLayout';
import { Button } from '../../Common/Button';
import { useParentReportData } from '../../hooks/useParentReportData';

type ParentModeReportProps = {
  childUserId: string; // 保護者が管理する子供のID
};

export function ParentModeReport({ childUserId }: ParentModeReportProps) {
  const { data, loading, error, refetch } = useParentReportData(childUserId);

  return (
    <LearningLayout title="学習管理" showBackButton={false}>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">お子様のレポート</h2>
        {loading && <p>レポートデータを取得中...</p>}
        {error && (
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-500">{error}</p>
            <Button onClick={refetch} className="mt-2">
              再取得
            </Button>
          </div>
        )}
        {data && (
          <div className="bg-white p-6 rounded shadow">
            {/* レポートの内容を表示（例：JSON形式） */}
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </LearningLayout>
  );
} 