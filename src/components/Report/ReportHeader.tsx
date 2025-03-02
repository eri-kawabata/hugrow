import { BarChart } from 'lucide-react';

export function ReportHeader() {
  return (
    <header className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 md:p-10 text-white shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <BarChart className="h-8 w-8" />
        <h1 className="text-2xl md:text-3xl font-bold">学習分析レポート</h1>
      </div>
      <p className="text-lg text-white/90">お子様の学習進捗と成長の詳細な記録</p>
    </header>
  );
} 