import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
  onFilter: (type: 'all' | 'image' | 'video') => void;
}

export function WorksHeader({ onSearch, onFilter }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
      <h1 className="text-2xl font-bold text-gray-900">作品集</h1>

      <div className="flex gap-4 w-full sm:w-auto">
        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="flex-1 sm:w-64">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="作品を検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </form>

        {/* フィルター */}
        <div className="relative">
          <select
            onChange={(e) => onFilter(e.target.value as 'all' | 'image' | 'video')}
            className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="image">写真</option>
            <option value="video">動画</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
} 