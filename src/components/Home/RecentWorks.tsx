import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Palette } from 'lucide-react';

interface Work {
  id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  created_at: string;
}

export function RecentWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorks() {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data) {
        setWorks(data);
      }
      setLoading(false);
    }

    fetchWorks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">まだ作品がありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {works.map(work => (
        <div key={work.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <img
            src={work.thumbnail_url}
            alt={work.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="p-6">
            <h3 className="font-semibold mb-2">{work.title}</h3>
            {work.description && (
              <p className="text-gray-600 text-sm">{work.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 