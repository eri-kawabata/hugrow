import React, { useState, useEffect, useCallback } from 'react';
import { BaseLayout } from './layouts/BaseLayout';
import { Heart, Star, Frown, Smile, Meh, ThumbsUp, MessageCircle, Sparkles, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar, Mic, MicOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { SELQuest, SELResponse } from '../lib/types';
import { GradientHeader } from '@/components/Common/GradientHeader';

// Web Speech APIの型定義
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: {
    [index: number]: {
      transcript: string;
    }
  };
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

const emotions = [
  { 
    name: 'とてもうれしい', 
    icon: Star, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    hoverBorderColor: 'hover:border-yellow-400',
    intensity: 5 
  },
  { 
    name: 'うれしい', 
    icon: Heart, 
    color: 'text-pink-500',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    hoverBorderColor: 'hover:border-pink-400',
    intensity: 4 
  },
  { 
    name: 'ふつう', 
    icon: Smile, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    hoverBorderColor: 'hover:border-purple-400',
    intensity: 3 
  },
  { 
    name: 'すこしかなしい', 
    icon: Meh, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    hoverBorderColor: 'hover:border-blue-400',
    intensity: 2 
  },
  { 
    name: 'かなしい', 
    icon: Frown,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    hoverBorderColor: 'hover:border-indigo-400',
    intensity: 1 
  },
] as const;

// Windowインターフェースを拡張
declare global {
  interface Window {
    switchChildProfile?: (childId: string) => void;
    availableChildProfiles?: {id: string, full_name: string}[];
  }
}

export function SELQuest() {
  const [selectedQuest, setSelectedQuest] = useState<SELQuest | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<SELResponse[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);
  const responsesPerPage = 5;
  // カレンダー表示用の状態
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  // 子供プロファイル関連の状態
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childProfiles, setChildProfiles] = useState<{id: string, full_name: string}[]>([]);
  const [selectedChildName, setSelectedChildName] = useState<string | null>(null);

  const fetchUserId = useCallback(async () => {
    if (!supabase) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return null;
      }

      return user.id;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      toast.error('ユーザー情報の取得に失敗しました');
      return null;
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const id = await fetchUserId();
      if (!id) return;
      
      setUserId(id);
      
      // URLからプロファイルIDを取得（URLパラメータ優先）
      const urlParams = new URLSearchParams(window.location.search);
      const profileId = urlParams.get('profile_id');

      console.log('初期化時にURLから取得したprofile_id:', profileId);

      if (profileId) {
        // プロファイルの存在を確認
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', profileId)
            .eq('role', 'child')
            .maybeSingle();
            
          if (!error && profileData) {
            console.log(`URLで指定されたプロファイルを選択しました:`, profileData.full_name);
            setSelectedChildId(profileId);
            setSelectedChildName(profileData.full_name);
            
            // 全ての子供プロファイルも取得し、状態を更新
            const { data: allProfiles } = await supabase
              .from('profiles')
              .select('id, full_name')
              .eq('role', 'child');
              
            if (allProfiles) {
              setChildProfiles(allProfiles);
            }
            
            await Promise.all([
              fetchQuests(),
              fetchResponses(id, profileId)
            ]);
            return; // URLにプロファイルIDがあれば、他の処理は行わない
          }
        } catch (e) {
          console.error('プロファイル確認エラー:', e);
        }
      }
      
      // ヘッダーからの情報取得を試みる
      await fetchChildProfiles(id);
      
      // リアルタイムでプロファイル変更を監視
      const profilesSubscription = supabase
        .channel('profiles-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles',
            filter: 'role=eq.child'
          }, 
          payload => {
            console.log('プロファイル変更検知:', payload);
            // 子供プロファイルの変更を検知したら一覧を再取得
            fetchChildProfiles(id);
          }
        )
        .subscribe();
        
      return () => {
        profilesSubscription.unsubscribe();
      };
    };

    initialize();
  }, [fetchUserId]);

  useEffect(() => {
    // Web Speech APIの初期化
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as { webkitSpeechRecognition: new () => SpeechRecognitionInterface }).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ja-JP';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        // Gemini APIを使用して漢字をひらがなに変換
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `以下の文章をひらがなだけで書き直してください。句読点は残してください。出力はひらがなの文章だけにしてください：${transcript}` }]
              }]
            }),
          }
        )
        .then(response => response.json())
        .then(data => {
          if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
            const hiragana = data.candidates[0].content.parts[0].text;
            setNote(prev => prev + hiragana);
          } else {
            setNote(prev => prev + transcript);
          }
        })
        .catch(error => {
          console.error('ひらがな変換エラー:', error);
          setNote(prev => prev + transcript);
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const fetchQuests = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('sel_quests')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      setSelectedQuest(data);
    } catch (error) {
      console.error('Error fetching quests:', error);
      toast.error('クエストの読み込みに失敗しました');
    }
  };

  const fetchResponses = async (id: string, profileId?: string | null) => {
    if (!supabase) return;

    try {
      // 選択された子供のプロファイルIDを使用
      const targetProfileId = profileId || selectedChildId;
      
      if (!targetProfileId) {
        console.warn('子供が選択されていません。');
        return;
      }

      console.log('fetchResponses: 使用するprofile_id:', targetProfileId);

      // 直接プロファイルIDで感情データを取得
      const { data, error } = await supabase
        .from('sel_responses')
        .select(`
          *,
          sel_feedback (
            id,
            feedback_text
          ),
          profiles:profile_id (
            full_name
          )
        `)
        .eq('profile_id', targetProfileId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      console.log('取得した感情データ:', data);
      
      if (data && data.length > 0 && data[0].profiles) {
        console.log('感情データの所有者:', data[0].profiles.full_name);
      }
      
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast.error('記録の読み込みに失敗しました');
    }
  };

  const fetchAIFeedback = async (emotion: string) => {
    try {
      if (!selectedEmotion) return;

      const selectedEmotionData = emotions.find(e => e.name === selectedEmotion);
      if (!selectedEmotionData) return;

      const prompt = `
      あなたは子どもの気持ちに寄り添う「ものしり博士」です。
      子どもが「${emotion}」という感情（つよさ: ${selectedEmotionData.intensity}）を感じています。
      ${note.trim() ? `その時（とき）のようすは「${note}」です。` : 'くわしいことは書かれていません。'}
      
      この感情とできごとにあわせて、子どもの気持ちに寄り添い、自信（じしん）を高め、成長（せいちょう）につながるメッセージを作成してください。
      
      メッセージは以下のルールに従って作成してください：
      
      1. 小学2年生までに習う漢字のみを使用し、必ずふりがなをつける
          使用可能な漢字の例：
         - 1年生：手（て）、目（め）、空（そら）、学校（がっこう）、先生（せんせい）
         - 2年生：親（おや）、友達（ともだち）、元気（げんき）、毎日（まいにち）
      2. それ以外の漢字は、ひらがなで書く
      3. 感情の種類に応じた対応：
         - うれしい感情の場合：いっしょによろこび、その気持ちをみんなとわかちあえることを伝える
         - かなしい感情の場合：気持ちに寄り添い、まえむきになれるヒントを伝える
         - ふつうの感情の場合：毎日（まいにち）のちいさなよいところを見つけて伝える
      4. 必ず以下の3つの要素を含める：
         - 気持ちへの共感
         - よいところの発見
         - つぎへのアドバイス
      5. 具体的なヒントを示す：
         - けんかの場合：「なかなおりのために、お友達（ともだち）の気持ちを聞（き）いてみよう」
         - しっぱいの場合：「つぎは上手（じょうず）にできるように、ゆっくりちょうせんしてみよう」
         - こまった時（とき）：「こまったときは、お友達（ともだち）や先生（せんせい）にそうだんしてみよう」
      6. 「はい、かしこまりました」などの前置きは不要
      7. 子どもに直接話しかける口調で書く
      8. 2-3文で簡潔に書く
      9. 文の最初と最後の「」（かぎかっこ）は不要
      
      出力形式：
      [子どもの気持ちに寄り添い、成長（せいちょう）につながるメッセージ（ふりがな付き）]
      
      例：
      ・けんかをした時（とき）の例：
      お友達（ともだち）とけんかして悲（かな）しかったね。でも、自分（じぶん）の気持ちを伝（つた）えられたのはえらいよ。明日（あした）、やさしく話（はな）しかけてみたら、きっとなかなおりできるよ！
      
      ・しっぱいして落（お）ち込（こ）んだ時（とき）の例：
      テストでうまくできなくてくやしかったね。一生けんめいに勉強（べんきょう）したあなたはすばらしいよ。つぎは先生（せんせい）にわからないところを聞（き）いてみよう！
      
      ・お友達（ともだち）と遊（あそ）べてうれしい時（とき）の例：
      お友達（ともだち）と楽（たの）しく遊（あそ）べてうれしかったね！みんなと仲良（なかよ）く遊（あそ）べるあなたは素敵（すてき）だよ。明日（あした）は新（あたら）しいお友達（ともだち）もさそってみたら、もっと楽（たの）しくなるね！`;

      const { data, error } = await supabase
        .from('sel_ai_feedback_templates')
        .select('feedback_template')
        .eq('emotion', emotion)
        .eq('intensity', selectedEmotionData.intensity)
        .single();

      if (error) throw error;

      // 子どもの出来事が入力されている場合は、Gemini APIを使用して具体的なメッセージを生成
      if (note.trim()) {
        try {
          const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
          
          if (!geminiApiKey) {
            console.error('Gemini API キーが設定されていません');
            setFeedback(data?.feedback_template || null);
            return;
          }
          
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }]
              }),
            }
          );
          
          if (!response.ok) {
            throw new Error(`Gemini API エラー: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.candidates && result.candidates[0]?.content?.parts?.length > 0) {
            const message = result.candidates[0].content.parts[0].text;
            setFeedback(message);
            return;
          } else {
            throw new Error('Gemini APIからの応答が不正な形式です');
          }
        } catch (error) {
          console.error('Gemini API エラー:', error);
          // エラーが発生した場合はデフォルトのテンプレートを使用
          setFeedback(data?.feedback_template || null);
          return;
        }
      }

      // 出来事が入力されていない場合は、デフォルトのテンプレートを使用
      setFeedback(data?.feedback_template || null);
    } catch (error) {
      console.error('Error fetching AI feedback:', error);
      setFeedback(null);
    }
  };

  const handleSubmit = async () => {
    if (!supabase || !selectedEmotion || !userId) {
      toast.error('感情を選択してください');
      return;
    }

    try {
      setLoading(true);

      // 選択された子供のプロファイルIDを使用
      if (!selectedChildId) {
        toast.error('子供を選択してください');
        setLoading(false);
        return;
      }

      console.log('handleSubmit: 使用するprofile_id:', selectedChildId);
      console.log('handleSubmit: 使用する子供名:', selectedChildName);

      // プロファイル情報を取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', selectedChildId)
        .single();

      if (profileError) {
        console.error('プロファイル取得エラー:', profileError);
        toast.error('プロファイル情報の取得に失敗しました');
        setLoading(false);
        return;
      }

      if (!profileData) {
        console.error('プロファイルが見つかりません');
        toast.error('プロファイル情報が見つかりません');
        setLoading(false);
        return;
      }

      console.log('取得したプロファイル:', profileData); // デバッグ用

      // 選択された感情からintensityを取得
      const selectedEmotionData = emotions.find(e => e.name === selectedEmotion);
      if (!selectedEmotionData) {
        toast.error('感情データが不正です');
        return;
      }

      // ものしり博士からのメッセージを取得
      await fetchAIFeedback(selectedEmotion);

      // quest_idを取得（選択されたクエストまたはデフォルトクエスト）
      let questId = selectedQuest?.id;
      
      // quest_idがない場合、デフォルトのクエストを取得
      if (!questId) {
        try {
          const { data, error } = await supabase
            .from('sel_quests')
            .select('id')
            .eq('emotion_type', 'daily_mood')
            .limit(1)
            .maybeSingle();
            
          if (error) throw error;
          questId = data?.id;
        } catch (err) {
          console.error('デフォルトクエスト取得エラー:', err);
          toast.error('クエスト情報の取得に失敗しました');
          setLoading(false);
          return;
        }
      }
      
      // quest_idがない場合はエラー
      if (!questId) {
        toast.error('クエスト情報が見つかりません');
        setLoading(false);
        return;
      }

      // 感情データを保存
      const responseData = {
        user_id: userId,
        profile_id: profileData.id,
        quest_id: questId,
        emotion: selectedEmotion,
        intensity: selectedEmotionData.intensity,
        note: note.trim() || null
      };

      console.log('保存するデータ:', responseData); // デバッグ用

      const { error: responseError } = await supabase
        .from('sel_responses')
        .insert([responseData]);

      if (responseError) {
        console.error('感情データ保存エラー:', responseError);
        throw responseError;
      }

      // 成功メッセージを表示
      toast.success(`${profileData.full_name}の気持ちを記録しました！`, {
        duration: 3000,
        position: 'top-center',
      });

      setNote('');
      setSelectedEmotion(null);
      fetchResponses(userId, selectedChildId);
    } catch (error) {
      console.error('Error:', error);
      toast.error('記録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error('お使いのブラウザでは音声入力がサポートされていません');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // 月を変更する関数
  const changeMonth = (increment: number) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + increment);
      return newMonth;
    });
  };

  // ページネーション関連の計算
  const totalPages = Math.ceil(responses.length / responsesPerPage);
  const displayedResponses = responses.slice(
    (currentPage - 1) * responsesPerPage,
    currentPage * responsesPerPage
  );

  // 次のページへ
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 前のページへ
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // レスポンスの展開/折りたたみを切り替える
  const toggleResponseExpand = (id: string) => {
    setExpandedResponseId(expandedResponseId === id ? null : id);
  };

  // 日付ごとにレスポンスをグループ化する関数
  const getResponsesByDate = useCallback(() => {
    const responseMap: Record<string, SELResponse[]> = {};
    
    responses.forEach(response => {
      const date = new Date(response.created_at);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!responseMap[dateKey]) {
        responseMap[dateKey] = [];
      }
      
      responseMap[dateKey].push(response);
    });
    
    return responseMap;
  }, [responses]);

  // カレンダーの日付を生成する関数
  const generateCalendarDays = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 月の最初の日の曜日を取得（0: 日曜日, 1: 月曜日, ...）
    const firstDay = new Date(year, month, 1).getDay();
    
    // 月の最終日を取得
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    // カレンダーの日付配列を生成
    const days = [];
    
    // 前月の日付を埋める
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // 当月の日付を埋める
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentMonth]);

  // 日付ごとのレスポンスを取得
  const responsesByDate = getResponsesByDate();
  const calendarDays = generateCalendarDays();

  // 子供プロファイル一覧を取得
  const fetchChildProfiles = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'child')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // 子供プロファイル一覧を状態に保存（内部処理用）
        setChildProfiles(data);
        
        // 1. URL検索（最優先）
        const urlParams = new URLSearchParams(window.location.search);
        const profileIdFromUrl = urlParams.get('profile_id');
          
        if (profileIdFromUrl) {
          const targetChild = data.find(child => child.id === profileIdFromUrl);
          if (targetChild) {
            setSelectedChildId(targetChild.id);
            setSelectedChildName(targetChild.full_name);
            fetchResponses(userId, targetChild.id);
            return;
          }
        }
        
        // 2. ヘッダーから子供名を取得（次に優先）
        try {
          // より多くのセレクタを追加して確実にヘッダーテキストを取得
          const headerElements = [
            ...document.querySelectorAll('header a'),
            ...document.querySelectorAll('header div'),
            ...document.querySelectorAll('header span'),
            ...document.querySelectorAll('a.cursor-pointer'),
            ...document.querySelectorAll('.cursor-pointer'),
            ...document.querySelectorAll('header'),
            ...document.querySelectorAll('nav a'),
            ...document.querySelectorAll('nav span'),
            ...document.querySelectorAll('.navbar'),
            ...document.querySelectorAll('.nav-item'),
            ...document.querySelectorAll('.user-menu'),
          ];
          
          let foundName = null;
          for (const el of headerElements) {
            const text = el.textContent || '';
            // より柔軟な正規表現パターンで「ようこそ」テキストから名前を抽出
            const matches = [
              text.match(/ようこそ[、,]?\s*([^\s]+)\s*さん/),
              text.match(/ようこそ\s*([^\s]+)\s*/),
              text.match(/([^\s]+)\s*さん/)
            ];
            
            for (const match of matches) {
              if (match && match[1]) {
                foundName = match[1];
                break;
              }
            }
            
            if (foundName) break;
          }
          
          if (foundName) {
            console.log('ヘッダーから抽出した名前:', foundName);
            
            // 名前の一部分が含まれるプロファイルを探す（部分一致）
            const targetChild = data.find(child => 
              child.full_name === foundName || 
              child.full_name.includes(foundName) ||
              foundName.includes(child.full_name)
            );
            
            if (targetChild) {
              setSelectedChildId(targetChild.id);
              setSelectedChildName(targetChild.full_name);
              fetchResponses(userId, targetChild.id);
              return;
            }
          }
        } catch (e) {
          console.error('ヘッダー情報取得エラー:', e);
        }
        
        // 3. 最終手段：先頭の子供を選択
        setSelectedChildId(data[0].id);
        setSelectedChildName(data[0].full_name);
        fetchResponses(userId, data[0].id);
      }
    } catch (error) {
      console.error('Error fetching child profiles:', error);
      toast.error('子供プロファイルの取得に失敗しました');
    }
  };

  // 子供の切り替え機能（コンソールからデバッグ用に使用可能）
  const switchChild = useCallback((childId: string) => {
    const child = childProfiles.find(c => c.id === childId);
    if (child && userId) {
      setSelectedChildId(childId);
      setSelectedChildName(child.full_name);
      fetchResponses(userId, childId);
      console.log(`子供を切り替えました: ${child.full_name}`);
    } else {
      console.error('指定されたIDの子供が見つかりません');
    }
  }, [childProfiles, userId]);

  // グローバルにデバッグ関数を公開（必要に応じてコンソールから使用）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.switchChildProfile = switchChild;
      window.availableChildProfiles = childProfiles;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.switchChildProfile;
        delete window.availableChildProfiles;
      }
    };
  }, [childProfiles, switchChild]);

  return (
    <BaseLayout hideHeader={true}>
      <div className="max-w-5xl mx-auto pb-28">
        <GradientHeader 
          title="きもちクエスト" 
          gradientColors={{
            from: '#FFB6C1',
            via: '#FFE4B5',
            to: '#E6E6FA'
          }}
        />

        {/* 現在選択されている子供の名前のみ表示（切り替えUIは削除） */}
        <div className="px-6 mb-4">
          {selectedChildName && (
            <div className="w-full flex items-center justify-center bg-indigo-50 rounded-full py-2 px-4 border border-indigo-100 text-indigo-700 text-sm font-medium">
              <span>{selectedChildName}さんの気持ち</span>
            </div>
          )}
        </div>

        <div className="px-6">
          <div className="space-y-8">
            {selectedQuest && (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-[28px] opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
                <div className="relative block bg-gradient-to-br from-white to-white/20 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-[#8ec5d6]">
                  <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
                  <div className="relative p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                        <Heart className="h-8 w-8 text-pink-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#5d7799]">{selectedQuest.title}</h2>
                    </div>
                    <p className="text-lg text-gray-700">{selectedQuest.description}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative group mt-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-[28px] opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
              <div className="relative block bg-gradient-to-br from-white to-white/20 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-[#8ec5d6]">
                <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
                <div className="relative p-6">
                  <h3 className="text-lg font-bold text-[#5d7799] mb-4">いまのきもちは？</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                    {emotions.map((emotion) => (
                      <button
                        key={emotion.name}
                        onClick={() => setSelectedEmotion(emotion.name)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 transform ${
                          selectedEmotion === emotion.name
                            ? `${emotion.bgColor} ${emotion.borderColor} scale-105 shadow-md`
                            : `bg-white/70 border-gray-100 ${emotion.hoverBorderColor} hover:scale-102 hover:shadow-sm`
                        }`}
                      >
                        <emotion.icon className={`h-8 w-8 ${emotion.color}`} />
                        <span className="text-sm font-medium">{emotion.name}</span>
                      </button>
                    ))}
                  </div>

                  <label className="block text-base font-bold text-[#5d7799] mb-2">
                    きょうのできごと
                  </label>
                  <div className="relative">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                      rows={3}
                      placeholder="どんなことがあったかな？"
                    />
                    <div className="absolute right-2 bottom-2 flex flex-col items-center gap-1">
                      <button
                        onClick={toggleListening}
                        className={`p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
                          isListening 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                        title={isListening ? '音声入力を停止' : '音声入力開始'}
                      >
                        {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                      </button>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {isListening ? 'タップして停止' : 'タップして話す'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedEmotion}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-xl text-base font-bold hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span>きろくする</span>
                  </button>

                  {/* ものしり博士からのメッセージ */}
                  {feedback && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 transform hover:scale-102 transition-transform">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-white rounded-lg">
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-base font-bold text-indigo-900">ものしり博士からのメッセージ</span>
                      </div>
                      <p className="text-sm text-indigo-700 leading-relaxed">{feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative group mt-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#60a5fa] via-[#e879f9] to-[#fcd34d] rounded-[28px] opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
              <div className="relative block bg-gradient-to-br from-white to-white/20 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-[#8ec5d6]">
                <div className="absolute inset-0 bg-white/90 transition-opacity group-hover:opacity-95"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-[#5d7799]">
                      <MessageCircle className="h-5 w-5 text-indigo-600" />
                      <span>これまでのきろく</span>
                      <span className="ml-2 text-sm font-normal text-gray-500">({responses.length}件)</span>
                    </h2>
                    
                    {/* 表示切替ボタン */}
                    <div className="flex rounded-lg overflow-hidden border border-indigo-200">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 text-xs font-medium ${
                          viewMode === 'list' 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-white text-indigo-500 hover:bg-indigo-50'
                        }`}
                      >
                        リスト
                      </button>
                      <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 ${
                          viewMode === 'calendar' 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-white text-indigo-500 hover:bg-indigo-50'
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        カレンダー
                      </button>
                    </div>
                  </div>
                  
                  {viewMode === 'list' ? (
                    <>
                      <div className="space-y-3">
                        {displayedResponses.map((response) => {
                          const emotion = emotions.find(e => e.name === response.emotion);
                          const isExpanded = expandedResponseId === response.id;
                          
                          return (
                            <div
                              key={response.id}
                              className={`rounded-xl border-2 ${
                                emotion?.borderColor || 'border-gray-100'
                              } ${emotion?.bgColor || 'bg-gray-50'} transition-all`}
                            >
                              <div 
                                className="p-3 flex items-center justify-between cursor-pointer hover:bg-opacity-80"
                                onClick={() => toggleResponseExpand(response.id)}
                              >
                                <div className="flex items-center gap-2">
                                  {emotion && <emotion.icon className={`h-5 w-5 ${emotion.color}`} />}
                                  <span className="font-bold text-sm">{response.emotion}</span>
                                  <span className="text-gray-600 text-xs">
                                    {new Date(response.created_at).toLocaleDateString('ja-JP')}
                                  </span>
                                </div>
                                {isExpanded ? 
                                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                }
                              </div>
                              
                              {isExpanded && (
                                <div className="px-3 pb-3">
                                  {response.note && (
                                    <div className="mb-3">
                                      <p className="text-xs text-gray-500 mb-1">きょうのできごと:</p>
                                      <p className="text-sm text-gray-700">{response.note}</p>
                                    </div>
                                  )}
                                  
                                  {response.sel_feedback && response.sel_feedback[0] && (
                                    <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <Sparkles className="h-4 w-4 text-indigo-600" />
                                        <span className="font-bold text-xs text-indigo-900">ものしり博士からのメッセージ</span>
                                      </div>
                                      <p className="text-xs text-indigo-700">{response.sel_feedback[0].feedback_text}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            {currentPage} / {totalPages} ページ
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={goToPrevPage}
                              disabled={currentPage === 1}
                              className={`p-1.5 rounded-full ${
                                currentPage === 1 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-indigo-600 hover:bg-indigo-50'
                              }`}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                              className={`p-1.5 rounded-full ${
                                currentPage === totalPages 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-indigo-600 hover:bg-indigo-50'
                              }`}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="calendar-view">
                      {/* カレンダーヘッダー */}
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          onClick={() => changeMonth(-1)}
                          className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <h3 className="text-base font-bold text-gray-700">
                          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                        </h3>
                        <button 
                          onClick={() => changeMonth(1)}
                          className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* 曜日ヘッダー */}
                      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                          <div 
                            key={day} 
                            className={`text-xs font-medium py-1 ${
                              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* カレンダー本体 */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                          if (!day) {
                            return <div key={`empty-${index}`} className="h-16 bg-gray-50 rounded-lg"></div>;
                          }
                          
                          const dateKey = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
                          const dayResponses = responsesByDate[dateKey] || [];
                          const hasResponses = dayResponses.length > 0;
                          
                          return (
                            <div 
                              key={dateKey}
                              className={`h-16 p-1 rounded-lg border ${
                                hasResponses 
                                  ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 cursor-pointer' 
                                  : 'border-gray-100 bg-white'
                              } relative`}
                              onClick={() => {
                                if (hasResponses && dayResponses[0]) {
                                  toggleResponseExpand(dayResponses[0].id);
                                }
                              }}
                            >
                              <div className="text-xs font-medium mb-1">
                                {day.getDate()}
                              </div>
                              
                              {hasResponses && (
                                <div className="flex flex-wrap gap-0.5">
                                  {dayResponses.slice(0, 3).map((response) => {
                                    const emotion = emotions.find(e => e.name === response.emotion);
                                    return (
                                      <div 
                                        key={response.id}
                                        className={`w-4 h-4 rounded-full ${emotion?.bgColor || 'bg-gray-200'} border ${emotion?.borderColor || 'border-gray-300'}`}
                                      >
                                        {expandedResponseId === response.id && (
                                          <div className="absolute top-full left-0 z-10 w-64 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                              {emotion && <emotion.icon className={`h-5 w-5 ${emotion.color}`} />}
                                              <span className="font-bold text-sm">{response.emotion}</span>
                                              <span className="text-gray-600 text-xs">
                                                {new Date(response.created_at).toLocaleDateString('ja-JP')}
                                              </span>
                                            </div>
                                            
                                            {response.note && (
                                              <div className="mb-3">
                                                <p className="text-xs text-gray-500 mb-1">きょうのできごと:</p>
                                                <p className="text-sm text-gray-700">{response.note}</p>
                                              </div>
                                            )}
                                            
                                            {response.sel_feedback && response.sel_feedback[0] && (
                                              <div className="p-2 bg-white/80 rounded-lg border border-indigo-100">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                  <Sparkles className="h-3 w-3 text-indigo-600" />
                                                  <span className="font-bold text-xs text-indigo-900">ものしり博士からのメッセージ</span>
                                                </div>
                                                <p className="text-xs text-indigo-700">{response.sel_feedback[0].feedback_text}</p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  
                                  {dayResponses.length > 3 && (
                                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-600">
                                      +{dayResponses.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default SELQuest;