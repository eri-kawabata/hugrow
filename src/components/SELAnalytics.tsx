import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, MessageCircle, Download, PieChart as PieChartIcon, BarChart as BarChartIcon, Brain, Lightbulb, ArrowLeft, Star, Heart, Smile, Frown, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, User, Meh } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SELResponse } from '../lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { toast } from 'react-hot-toast';
import { format, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// きもちクエストと同じ感情定義
const emotions = [
  { 
    name: 'とてもうれしい', 
    icon: Star, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    hoverBorderColor: 'hover:border-yellow-400',
    intensity: 5, 
    chartColor: '#FCD34D' 
  },
  { 
    name: 'うれしい', 
    icon: Heart, 
    color: 'text-pink-500',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    hoverBorderColor: 'hover:border-pink-400',
    intensity: 4, 
    chartColor: '#F472B6' 
  },
  { 
    name: 'ふつう', 
    icon: Smile, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    hoverBorderColor: 'hover:border-purple-400',
    intensity: 3, 
    chartColor: '#A78BFA' 
  },
  { 
    name: 'すこしかなしい', 
    icon: Meh, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    hoverBorderColor: 'hover:border-blue-400',
    intensity: 2, 
    chartColor: '#60A5FA' 
  },
  { 
    name: 'かなしい', 
    icon: Frown, 
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    hoverBorderColor: 'hover:border-indigo-400',
    intensity: 1, 
    chartColor: '#818CF8' 
  },
];

// Y軸のカスタムティック
const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const emotion = emotions.find(e => e.intensity === payload.value);
  
  if (!emotion) return null;
  
  const Icon = emotion.icon;
  
  return (
    <g transform={`translate(${x - 40},${y})`}>
      <foreignObject width="40" height="40" x="0" y="-20">
        <div className="flex items-center justify-center h-full">
          <Icon className={`${emotion.color}`} size={24} />
        </div>
      </foreignObject>
    </g>
  );
};

type TimeRange = 'week' | 'month' | 'year';

export function SELAnalytics() {
  console.log('SELAnalytics component rendered - きもちクエスト版');
  
  const navigate = useNavigate();
  const [responses, setResponses] = useState<SELResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [childName, setChildName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'insights'>('overview');
  
  // 詳細記録のための状態
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // fetchResponses関数を追加
  const fetchResponses = async () => {
    if (!selectedChildId) {
      console.log('No child selected');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching responses for child:', selectedChildId);
      const { data, error } = await supabase
        .from('sel_responses')
        .select('*')
        .eq('profile_id', selectedChildId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched responses:', data);
      setResponses(data || []);
    } catch (error) {
      console.error('感情データの取得エラー:', error);
      toast.error('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('SELAnalytics useEffect triggered - きもちクエスト版');
    fetchResponses();
  }, [timeRange, selectedChildId]); // selectedChildIdを依存配列に追加

  // 子供一覧を取得
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 親のプロファイルIDを取得
        const { data: parentProfile, error: parentError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role', 'parent')
          .single();

        if (parentError) {
          console.error('親プロファイル取得エラー:', parentError);
          return;
        }

        // 親に関連付けられた子供を取得
        const { data: childProfiles, error: childrenError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, user_id')
          .eq('parent_id', parentProfile.id)
          .eq('role', 'child');

        if (childrenError) {
          console.error('子供プロファイル取得エラー:', childrenError);
          return;
        }

        setChildren(childProfiles || []);
        
        // 最初の子供を選択
        if (childProfiles && childProfiles.length > 0) {
          setSelectedChildId(childProfiles[0].id);
        }
      } catch (err) {
        console.error('子供データ取得エラー:', err);
      }
    };

    fetchChildren();
  }, []);

  // 感情トレンドデータの生成
  const emotionTrendData = useMemo(() => {
    if (!responses.length) return [];

    // 日付ごとにグループ化
    const groupedByDate: Record<string, { 
      intensitySum: number, 
      count: number, 
      emotions: Record<string, number>,
      lastCreatedAt: string 
    }> = {};

    // 日付フォーマットを「yyyy-MM-dd」形式に統一して集計
    responses.forEach(response => {
      const date = new Date(response.created_at);
      const dateKey = format(date, 'yyyy-MM-dd');
      const emotion = response.emotion;
      const emotionObj = emotions.find(e => e.name === emotion);
      const intensity = emotionObj?.intensity || 3;

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { 
          intensitySum: 0, 
          count: 0, 
          emotions: {},
          lastCreatedAt: response.created_at
        };
      } else if (new Date(response.created_at) > new Date(groupedByDate[dateKey].lastCreatedAt)) {
        // 最新の記録を保持
        groupedByDate[dateKey].lastCreatedAt = response.created_at;
      }

      groupedByDate[dateKey].intensitySum += intensity;
      groupedByDate[dateKey].count += 1;
      
      // 感情の出現回数をカウント
      if (!groupedByDate[dateKey].emotions[emotion]) {
        groupedByDate[dateKey].emotions[emotion] = 0;
      }
      groupedByDate[dateKey].emotions[emotion] += 1;
    });

    // 日付ごとの平均強度と最も多かった感情を計算
    const result = Object.entries(groupedByDate).map(([dateKey, data]) => {
      const avgIntensity = data.intensitySum / data.count;
      
      // その日の最も多かった感情を特定
      let mostFrequentEmotion = '';
      let maxCount = 0;
      
      Object.entries(data.emotions).forEach(([emotion, count]) => {
        if (count > maxCount) {
          mostFrequentEmotion = emotion;
          maxCount = count;
        }
      });

      return {
        date: format(new Date(dateKey), 'MM/dd', { locale: ja }),
        emotion: mostFrequentEmotion,
        intensity: avgIntensity,
        count: data.count,
        rawDate: dateKey
      };
    });

    // 日付順にソート
    return result.sort((a, b) => 
      new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
    );
  }, [responses]);

  // 感情分布データの生成
  const emotionDistributionData = useMemo(() => {
    if (!responses.length) return [];

    const distribution: Record<string, number> = {};
    
    responses.forEach(response => {
      distribution[response.emotion] = (distribution[response.emotion] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => {
      const emotionInfo = emotions.find(e => e.name === name);
      return {
        name,
        value,
        color: emotionInfo?.chartColor || '#CBD5E1',
      };
    });
  }, [responses]);

  // 曜日ごとの感情データ
  const dayOfWeekData = useMemo(() => {
    if (!responses.length) return [];

    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const dayData = days.map(day => ({ name: day, value: 0 }));
    
    responses.forEach(response => {
      const date = new Date(response.created_at);
      const dayIndex = date.getDay();
      dayData[dayIndex].value += 1;
    });
    
    return dayData;
  }, [responses]);

  // 感情パターンの分析
  const emotionPatterns = useMemo(() => {
    if (responses.length < 3) return [];

    const patterns = [];
    let currentEmotion = '';
    let streak = 0;
    let startDate = '';
    let endDate = '';

    // 日付順にソート
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedResponses.forEach((response, index) => {
      if (response.emotion === currentEmotion) {
        streak++;
        endDate = format(new Date(response.created_at), 'MM/dd', { locale: ja });
      } else {
        if (streak >= 2) {
          patterns.push({
            emotion: currentEmotion,
            streak,
            startDate,
            endDate
          });
        }
        currentEmotion = response.emotion;
        streak = 1;
        startDate = format(new Date(response.created_at), 'MM/dd', { locale: ja });
        endDate = startDate;
      }
    });

    // 最後のパターンも追加
    if (streak >= 2) {
      patterns.push({
        emotion: currentEmotion,
        streak,
        startDate,
        endDate
      });
    }

    return patterns;
  }, [responses]);

  // インサイトを生成
  const insights = useMemo(() => {
    const result = [];
    
    // データが少ない場合
    if (responses.length < 3) {
      result.push('まだ十分なデータがありません。より多くの感情を記録すると、詳細な分析が可能になります。');
      return result;
    }
    
    // 最も多い感情
    const mostCommonEmotion = emotionDistributionData.sort((a, b) => b.value - a.value)[0];
    if (mostCommonEmotion) {
      result.push(`最も多く記録された感情は「${mostCommonEmotion.name}」です（${mostCommonEmotion.value}回）。`);
    }
    
    // 感情の変化パターン
    if (emotionPatterns.length > 0) {
      const longestPattern = emotionPatterns.sort((a, b) => b.streak - a.streak)[0];
      result.push(`「${longestPattern.emotion}」の感情が${longestPattern.streak}回連続で記録されました（${longestPattern.endDate}まで）。`);
    }
    
    // 曜日ごとの傾向
    const maxDayIndex = dayOfWeekData.reduce((maxIndex, item, index, array) => 
      item.value > array[maxIndex].value ? index : maxIndex, 0);
    if (dayOfWeekData[maxDayIndex].value > 0) {
      result.push(`${dayOfWeekData[maxDayIndex].name}曜日に最も多く感情が記録されています。`);
    }
    
    // 感情の多様性
    const uniqueEmotions = emotionDistributionData.length;
    if (uniqueEmotions >= 4) {
      result.push('感情表現が豊かで、自己認識が高まっています。');
    } else if (uniqueEmotions <= 2) {
      result.push('感情の表現の幅を広げると、より自己理解が深まるかもしれません。');
    }
    
    // 感情の強度分析
    const intensitySum = responses.reduce((sum, response) => {
      const emotion = emotions.find(e => e.name === response.emotion);
      return sum + (emotion?.intensity || 3);
    }, 0);
    const avgIntensity = intensitySum / responses.length;
    
    if (avgIntensity > 4) {
      result.push('全体的にポジティブな感情が多く記録されています。');
    } else if (avgIntensity < 2.5) {
      result.push('全体的にネガティブな感情が多く記録されています。最近の出来事について話し合ってみるといいかもしれません。');
    }

    // 時間帯別の感情傾向
    const morningResponses = responses.filter(r => {
      const hour = new Date(r.created_at).getHours();
      return hour >= 5 && hour < 12;
    });
    
    const afternoonResponses = responses.filter(r => {
      const hour = new Date(r.created_at).getHours();
      return hour >= 12 && hour < 18;
    });
    
    const eveningResponses = responses.filter(r => {
      const hour = new Date(r.created_at).getHours();
      return hour >= 18 || hour < 5;
    });

    // 時間帯別の感情強度平均を計算
    if (morningResponses.length >= 3 && afternoonResponses.length >= 3) {
      const morningIntensity = morningResponses.reduce((sum, r) => {
        const emotion = emotions.find(e => e.name === r.emotion);
        return sum + (emotion?.intensity || 3);
      }, 0) / morningResponses.length;
      
      const afternoonIntensity = afternoonResponses.reduce((sum, r) => {
        const emotion = emotions.find(e => e.name === r.emotion);
        return sum + (emotion?.intensity || 3);
      }, 0) / afternoonResponses.length;
      
      if (morningIntensity > afternoonIntensity + 1) {
        result.push('朝の時間帯の方が、午後よりもポジティブな感情が多く記録されています。');
      } else if (afternoonIntensity > morningIntensity + 1) {
        result.push('午後の時間帯の方が、朝よりもポジティブな感情が多く記録されています。');
      }
    }

    // 感情の変化傾向（上昇・下降）
    if (responses.length >= 5) {
      const sortedByDate = [...responses].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // 最新の5件を取得
      const recentResponses = sortedByDate.slice(-5);
      
      // 感情強度の変化を計算
      const intensityTrend = recentResponses.map(r => {
        const emotion = emotions.find(e => e.name === r.emotion);
        return emotion?.intensity || 3;
      });
      
      // 単純な線形回帰で傾向を計算
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let i = 0; i < intensityTrend.length; i++) {
        sumX += i;
        sumY += intensityTrend[i];
        sumXY += i * intensityTrend[i];
        sumX2 += i * i;
      }
      
      const n = intensityTrend.length;
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      
      if (slope > 0.3) {
        result.push('最近の感情記録では、ポジティブな感情が増加傾向にあります。');
      } else if (slope < -0.3) {
        result.push('最近の感情記録では、ネガティブな感情が増加傾向にあります。子どもの様子に注意してみてください。');
      }
    }

    // メモの内容分析（キーワード出現頻度）
    const notesWithContent = responses.filter(r => r.note && r.note.trim().length > 0);
    if (notesWithContent.length >= 3) {
      // メモの記入率
      const noteRate = (notesWithContent.length / responses.length) * 100;
      if (noteRate > 70) {
        result.push('感情記録にメモが詳しく記入されています。子どもの感情の理解に役立ちます。');
      } else if (noteRate < 30) {
        result.push('感情記録にメモが少ないです。メモを追加すると、感情の背景をより理解しやすくなります。');
      }
    }

    // 新しい分析: 季節ごとの感情傾向
    if (responses.length >= 10) {
      const seasonalData = {
        spring: { count: 0, intensitySum: 0 }, // 3-5月
        summer: { count: 0, intensitySum: 0 }, // 6-8月
        autumn: { count: 0, intensitySum: 0 }, // 9-11月
        winter: { count: 0, intensitySum: 0 }  // 12-2月
      };

      responses.forEach(response => {
        const date = new Date(response.created_at);
        const month = date.getMonth();
        const emotion = emotions.find(e => e.name === response.emotion);
        const intensity = emotion?.intensity || 3;

        if (month >= 2 && month <= 4) {
          // 春 (3-5月)
          seasonalData.spring.count++;
          seasonalData.spring.intensitySum += intensity;
        } else if (month >= 5 && month <= 7) {
          // 夏 (6-8月)
          seasonalData.summer.count++;
          seasonalData.summer.intensitySum += intensity;
        } else if (month >= 8 && month <= 10) {
          // 秋 (9-11月)
          seasonalData.autumn.count++;
          seasonalData.autumn.intensitySum += intensity;
        } else {
          // 冬 (12-2月)
          seasonalData.winter.count++;
          seasonalData.winter.intensitySum += intensity;
        }
      });

      // 季節ごとの平均感情強度を計算
      const seasons = Object.entries(seasonalData)
        .filter(([_, data]) => data.count >= 3)
        .map(([season, data]) => ({
          season,
          avgIntensity: data.intensitySum / data.count
        }));

      if (seasons.length >= 2) {
        // 最もポジティブな季節と最もネガティブな季節を見つける
        seasons.sort((a, b) => b.avgIntensity - a.avgIntensity);
        const mostPositive = seasons[0];
        const mostNegative = seasons[seasons.length - 1];

        if (mostPositive.avgIntensity - mostNegative.avgIntensity >= 0.8) {
          const seasonNames = {
            spring: '春',
            summer: '夏',
            autumn: '秋',
            winter: '冬'
          };
          
          result.push(`${seasonNames[mostPositive.season as keyof typeof seasonNames]}の季節は、${seasonNames[mostNegative.season as keyof typeof seasonNames]}の季節よりもポジティブな感情が多く記録されています。`);
        }
      }
    }

    // 新しい分析: 感情の強度と曜日の相関
    if (responses.length >= 10) {
      const dayIntensities = Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
      
      responses.forEach(response => {
        const date = new Date(response.created_at);
        const dayIndex = date.getDay();
        const emotion = emotions.find(e => e.name === response.emotion);
        const intensity = emotion?.intensity || 3;
        
        dayIntensities[dayIndex].sum += intensity;
        dayIntensities[dayIndex].count++;
      });
      
      const daysWithData = dayIntensities
        .map((data, index) => ({ 
          day: index, 
          avgIntensity: data.count > 0 ? data.sum / data.count : 0,
          count: data.count
        }))
        .filter(day => day.count >= 2);
      
      if (daysWithData.length >= 2) {
        daysWithData.sort((a, b) => b.avgIntensity - a.avgIntensity);
        const bestDay = daysWithData[0];
        const worstDay = daysWithData[daysWithData.length - 1];
        
        if (bestDay.avgIntensity - worstDay.avgIntensity >= 1) {
          const days = ['日', '月', '火', '水', '木', '金', '土'];
          result.push(`${days[bestDay.day]}曜日は最もポジティブな感情が記録される傾向があり、${days[worstDay.day]}曜日は比較的ネガティブな感情が記録される傾向があります。`);
        }
      }
    }

    // 新しい分析: 連続記録の評価
    const sortedByDate = [...responses].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    if (sortedByDate.length >= 5) {
      const streaks = [];
      let currentStreak = 1;
      let lastDate = new Date(sortedByDate[0].created_at);
      
      for (let i = 1; i < sortedByDate.length; i++) {
        const currentDate = new Date(sortedByDate[i].created_at);
        const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          currentStreak++;
        } else {
          streaks.push(currentStreak);
          currentStreak = 1;
        }
        
        lastDate = currentDate;
      }
      
      streaks.push(currentStreak);
      const maxStreak = Math.max(...streaks);
      
      if (maxStreak >= 5) {
        result.push(`${maxStreak}日連続で感情を記録した期間があります。継続的な記録は感情の変化を理解するのに役立ちます。`);
      } else if (sortedByDate.length >= 10 && maxStreak < 3) {
        result.push('より定期的に感情を記録すると、感情の変化パターンをより正確に把握できます。');
      }
    }

    return result;
  }, [responses, emotionDistributionData, emotionPatterns, dayOfWeekData]);

  const handleExport = () => {
    if (!responses.length) return;

    try {
      // CSVヘッダー
      let csv = '日付,感情,強度,メモ\n';
      
      // データ行の追加
      responses.forEach(response => {
        const date = format(new Date(response.created_at), 'yyyy/MM/dd HH:mm', { locale: ja });
        const row = [
          `"${date}"`,
          `"${response.emotion}"`,
          response.intensity,
          `"${response.note || ''}"`
        ].join(',');
        csv += row + '\n';
      });
      
      // ダウンロード用のリンク作成
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `感情記録_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
    link.click();
      document.body.removeChild(link);
      
      toast.success('CSVファイルをダウンロードしました');
    } catch (error) {
      console.error('エクスポートエラー:', error);
      toast.error('エクスポートに失敗しました');
    }
  };

  // 詳細記録のソートとフィルタリング
  const filteredAndSortedResponses = useMemo(() => {
    let result = [...responses];
    
    // 感情でフィルタリング
    if (emotionFilter !== 'all') {
      result = result.filter(r => r.emotion === emotionFilter);
    }
    
    // 日付でソート
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [responses, emotionFilter, sortDirection]);
  
  // ページネーション
  const totalPages = Math.ceil(filteredAndSortedResponses.length / itemsPerPage);
  const paginatedResponses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedResponses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedResponses, currentPage]);
  
  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // ソート方向切り替え
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // 子供選択コンポーネント
  const ChildSelector = () => (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-[#5d7799] mb-4">お子様を選択</h3>
      <div className="flex flex-wrap gap-3">
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => setSelectedChildId(child.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              selectedChildId === child.id 
                ? 'bg-[#5d7799] text-white' 
                : 'bg-gray-100 text-[#5d7799] hover:bg-gray-200'
            }`}
          >
            {child.avatar_url ? (
              <img 
                src={child.avatar_url} 
                alt={child.username} 
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span>{child.username}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-32">
      {/* 完全に新しいヘッダーデザイン */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-6 text-white shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">感情分析レポート</h1>
            <p className="opacity-90">
              {childName ? `${childName}さん` : 'お子様'}の感情の傾向を分析し、理解を深めるためのツールです
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* 子供選択UIをここに移動 */}
      <ChildSelector />

      {/* 期間選択部分をボタン形式に変更 */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-medium text-gray-900">期間</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'week'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1週間
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'month'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1ヶ月
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'year'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1年
            </button>
          </div>
        </div>
        </div>

      {/* タブナビゲーションのデザイン改善 */}
      <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp size={18} />
              <span>概要</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-all ${
              activeTab === 'insights'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lightbulb size={18} />
              <span>インサイト</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-all ${
              activeTab === 'details'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChartIcon size={18} />
              <span>詳細記録</span>
            </div>
          </button>
        </nav>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">データを読み込み中...</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <MessageCircle size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">まだ回答がありません</h3>
          <p className="text-gray-500 mb-6">
            この期間には感情の記録がありません。別の期間を選択するか、新しい回答を追加してください。
          </p>
          <button
            onClick={() => navigate('/child/sel-quest')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            新しい回答を追加
          </button>
        </div>
      ) : (
        <div>
          {/* タブコンテンツ */}
          {activeTab === 'overview' && (
            <div className="space-y-8 mb-16">
              {/* 感情トレンドグラフ */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">感情の推移</h2>
                    <div className="text-xs text-gray-500">
                      ※一日に複数回記録された場合は、その日の最も多かった感情と平均強度を表示しています
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={emotionTrendData} 
                      margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis 
                        domain={[1, 5]} 
                        ticks={[1, 2, 3, 4, 5]} 
                        tick={<CustomYAxisTick />}
                        width={50}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload?.length) return null;
                          const data = payload[0].payload;
                          const emotion = emotions.find(e => e.name === data.emotion);
                          if (!emotion) return null;
                          
                          const Icon = emotion.icon;
                          
                          return (
                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow">
                              <div className="flex items-center gap-3 mb-2">
                                <Icon className={emotion.color} size={24} />
                                <span className="font-medium text-lg">{data.emotion}</span>
                              </div>
                              <p className="text-gray-500">{format(new Date(data.rawDate), 'yyyy/MM/dd', { locale: ja })}</p>
                              <p className="text-gray-500">感情強度: {data.intensity.toFixed(1)}</p>
                              {data.count > 1 && (
                                <p className="text-gray-500 mt-1">
                                  この日は{data.count}回記録されています
                                  <br />
                                  <span className="text-xs text-gray-400">（最も多かった感情を表示）</span>
                                </p>
                              )}
                            </div>
                          );
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="intensity"
                        stroke="#6366F1"
                        strokeWidth={2}
                        dot={{ fill: '#6366F1', r: 4 }}
                        activeDot={{ r: 6, fill: '#4F46E5' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 感情分布 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-medium text-gray-900">感情の分布</h2>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                      <Pie
                        data={emotionDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ name, value, percent }) => {
                          // NaN%を防ぐため、percentが有効な数値かチェック
                          const percentText = percent && !isNaN(percent) ? `${(percent * 100).toFixed(0)}%` : '';
                          return `${name} ${percentText}`;
                        }}
                        labelLine={true}
                        animationDuration={500}
                      >
                        {emotionDistributionData.map((entry, index) => {
                          const emotion = emotions.find(e => e.name === entry.name);
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={emotion?.chartColor || entry.color} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        content={({ payload }) => {
                          if (!payload?.length) return null;
                          const data = payload[0];
                          const emotion = emotions.find(e => e.name === data.name);
                          if (!emotion) return null;
                          
                          const Icon = emotion.icon;
                          // NaN%を防ぐため、percentが有効な数値かチェック
                          const percent = data.payload.percent;
                          const percentText = percent && !isNaN(percent) ? `(${(percent * 100).toFixed(0)}%)` : '';
                          
                          return (
                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow">
                              <div className="flex items-center gap-3 mb-2">
                                <Icon className={emotion.color} size={24} />
                                <span className="font-medium text-lg">{data.name}</span>
                              </div>
                              <p className="text-gray-500">{data.value}回 {percentText}</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {/* インサイトタブ */}
          {activeTab === 'insights' && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-purple-100">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-medium text-gray-900">感情の分析</h2>
              </div>
              <div className="space-y-6">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                      <p className="text-indigo-800">{insight}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600">まだ十分なデータがありません。より多くの感情を記録すると、詳細な分析が可能になります。</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 詳細記録タブ */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChartIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-900">詳細記録</h2>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* 感情フィルター */}
                  <div className="flex items-center">
                    <label htmlFor="emotion-filter" className="mr-2 text-sm text-gray-600">感情:</label>
                    <select
                      id="emotion-filter"
                      value={emotionFilter}
                      onChange={(e) => {
                        setEmotionFilter(e.target.value);
                        setCurrentPage(1); // フィルター変更時は1ページ目に戻る
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="all">すべて</option>
                      {emotions.map(emotion => (
                        <option key={emotion.name} value={emotion.name}>{emotion.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* エクスポートボタン */}
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Download size={16} className="mr-1.5" />
                    CSVエクスポート
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={toggleSortDirection}
                      >
                        <div className="flex items-center">
                          日付
                          {sortDirection === 'desc' ? 
                            <ChevronDown size={16} className="ml-1" /> : 
                            <ChevronUp size={16} className="ml-1" />
                          }
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        感情
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        強度
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        コメント
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedResponses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          {emotionFilter !== 'all' ? 
                            `「${emotionFilter}」の感情記録はありません。` : 
                            '表示するデータがありません。'}
                        </td>
                      </tr>
                    ) : (
                      paginatedResponses.map((response, index) => {
                        const emotion = emotions.find(e => e.name === response.emotion);
                        if (!emotion) return null;

                        const Icon = emotion.icon;

                        return (
                          <tr key={response.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(response.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${emotion.bgColor} ${emotion.color}`}>
                                <span className="mr-2">
                                  <Icon size={20} />
                                </span>
                      {response.emotion}
                    </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {response.intensity}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {response.note || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      前へ
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      次へ
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{filteredAndSortedResponses.length}</span> 件中 
                        <span className="font-medium"> {(currentPage - 1) * itemsPerPage + 1} </span>
                        から
                        <span className="font-medium"> {Math.min(currentPage * itemsPerPage, filteredAndSortedResponses.length)} </span>
                        件を表示
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                        >
                          <span className="sr-only">前へ</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // 表示するページ番号を計算
                          let pageNum;
                          if (totalPages <= 5) {
                            // 5ページ以下なら全部表示
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            // 現在が前方なら1〜5を表示
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // 現在が後方ならtotalPages-4〜totalPagesを表示
                            pageNum = totalPages - 4 + i;
                          } else {
                            // それ以外なら現在ページの前後2ページずつ表示
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                currentPage === pageNum
                                  ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                        >
                          <span className="sr-only">次へ</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
          </div>
          )}
        </div>
      )}
      {/* 下部に余白を追加 */}
      <div className="h-8"></div>
    </div>
  );
} 