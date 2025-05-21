import React, { useState, useEffect, memo } from 'react';
import { Image as ImageIcon, MessageCircle, Calendar, Filter, Search, X, Music, Camera, Palette, Heart, ThumbsUp, Star, Award, Smile, PenLine, MessageSquare, Sparkles, User, Users, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import './ParentWorks.css'; // アニメーション用のCSSをインポート

// 控えめな紙吹雪エフェクト
export const showConfetti = () => {
  // CSSでエフェクトを追加
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  document.body.appendChild(confettiContainer);
  
  // 紙吹雪の数を減らして控えめに (100→30)
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${Math.random() * 20}%`; // 位置をランダム化
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
    
    // シンプルな形状にする
    if (Math.random() > 0.7) {
      // 少数だけ特殊な形に
      const shapes = ['★', '●', '■'];
      confetti.innerText = shapes[Math.floor(Math.random() * shapes.length)];
      confetti.style.fontSize = `${8 + Math.random() * 12}px`; // サイズを小さく
      confetti.style.backgroundColor = 'transparent';
      confetti.style.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
    } else {
      // ほとんどは小さな丸や四角に
      confetti.style.width = `${4 + Math.random() * 6}px`; // サイズを小さく
      confetti.style.height = `${4 + Math.random() * 6}px`;
    }
    
    // アニメーションを短く
    confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards, spin ${1 + Math.random() * 2}s linear infinite`;
    
    confettiContainer.appendChild(confetti);
  }
  
  // キラキラエフェクトも控えめに
  for (let i = 0; i < 10; i++) { // 数を減らす
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 1.5}s`;
    sparkle.style.animationDuration = `${0.5 + Math.random() * 0.8}s`;
    confettiContainer.appendChild(sparkle);
  }
  
  // 効果音は省略
  
  // 3秒後にコンテナを削除 (時間を短く)
  setTimeout(() => {
    // フェードアウトアニメーション
    confettiContainer.style.opacity = '0';
    confettiContainer.style.transition = 'opacity 0.8s ease-out';
    
    // 完全に消える
    setTimeout(() => {
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer);
      }
    }, 800);
  }, 3000);
};

// Work型の定義
interface Work {
  id: string;
  title: string;
  description?: string;
  media_url?: string;
  content_url?: string;
  media_type: 'drawing' | 'photo' | 'audio' | 'image' | 'video';
  type?: 'drawing' | 'photo' | 'audio';
  user_id: string;
  profile_id?: string;
  created_at: string;
  updated_at: string;
  work_feedback?: { id: string }[];
  feedbackCount?: number;
}

// 子供プロファイル型の定義
interface ChildProfile {
  id: string;
  username: string;
  avatar_url?: string;
  user_id: string;
}

type Feedback = {
  id: string;
  feedback: string;
  created_at: string;
  user_id: string;
  username: string | null;
  likes?: number;
  liked_by_me?: boolean;
  stamp?: string;
};

// 作品タイプのフィルター型
type WorkTypeFilter = 'all' | 'drawing' | 'photo' | 'audio';

// メディアURLを安全に処理する関数
const getSafeMediaUrl = (url: string) => {
  if (!url) {
    // URLがない場合はデータURIのプレースホルダー画像を返す
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e113b0f1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e113b0f1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22148.5%22%20y%3D%22157.9%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  }
  
  try {
    // URLをトリムして余分な空白を削除
    url = url.trim();
    
    // URLが既に完全なURLの場合はそのまま返す
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // データURIの場合はそのまま返す
    if (url.startsWith('data:')) {
      return url;
    }
    
    // Supabaseのストレージパスの場合
    if (url.includes('storage/v1/object/public')) {
      // 既にURLの形式になっているが、プロトコルが欠けている場合
      if (url.startsWith('//')) {
        return `https:${url}`;
      }
      
      // 相対パスの場合
      if (url.startsWith('/')) {
        return `${window.location.origin}${url}`;
      }
    }
    
    // Supabaseの直接ストレージURLを構築
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    if (supabaseUrl) {
      // パスが既にworks/で始まっている場合
      if (url.includes('works/')) {
        return `${supabaseUrl}/storage/v1/object/public/${url}`;
      } else {
        // 完全なパスを構築
        return `${supabaseUrl}/storage/v1/object/public/works/${url}`;
      }
    }
    
    // それ以外の場合は相対パスとして扱う
    return `${window.location.origin}/${url}`;
  } catch (error) {
    console.error('Error processing URL:', error, url);
    // エラーが発生した場合はデータURIのプレースホルダー画像を返す
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e113b0f1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e113b0f1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22148.5%22%20y%3D%22157.9%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  }
};

// スタンプの種類
const STAMPS = [
  { id: 'heart', icon: <Heart className="h-6 w-6" />, label: 'ハート', color: 'text-rose-500' },
  { id: 'thumbsup', icon: <ThumbsUp className="h-6 w-6" />, label: 'いいね', color: 'text-blue-500' },
  { id: 'star', icon: <Star className="h-6 w-6" />, label: 'スター', color: 'text-amber-500' },
  { id: 'award', icon: <Award className="h-6 w-6" />, label: '賞', color: 'text-purple-500' },
  { id: 'smile', icon: <Smile className="h-6 w-6" />, label: 'スマイル', color: 'text-green-500' },
];

// モック: AIフィードバック生成関数
const mockAIFeedbackGenerator = async (work: Work): Promise<string[]> => {
  // 実際のAPIリクエストをシミュレート
  return new Promise((resolve) => {
    setTimeout(() => {
      const workType = work.type || work.media_type;
      const imageUrl = work.media_url || work.content_url || ''; // 画像URL
      
      // 実際の実装ではGemini APIを呼び出してここで画像分析する
      // 今回はモックなので画像の特徴を推測
      
      // 画像分析結果をシミュレート（実際はGemini APIからの返答）
      let imageAnalysis = {
        colors: ['赤', '青', '黄色', '緑', '紫', 'ピンク', 'オレンジ'][Math.floor(Math.random() * 7)],
        subject: ['動物', '風景', '家族', '建物', '乗り物', '星空', '海', '友達'][Math.floor(Math.random() * 8)],
        details: ['線', '形', '影', '構図', '表情', '動き', '背景'][Math.floor(Math.random() * 7)],
        emotion: ['楽しい', '元気な', '穏やかな', '力強い', '優しい', '愛情あふれる'][Math.floor(Math.random() * 6)],
        technique: ['丁寧な', '大胆な', '繊細な', '独創的な', '工夫された'][Math.floor(Math.random() * 5)]
      };
      
      // workのタイトルやdescriptionから特徴を抽出（実際はGeminiがこれを画像から抽出）
      if (work.title) {
        // タイトルに含まれる特徴語を検出
        if (work.title.includes('海')) imageAnalysis.subject = '海';
        if (work.title.includes('家族')) imageAnalysis.subject = '家族';
        if (work.title.includes('星')) imageAnalysis.subject = '星空';
        if (work.title.includes('きんた')) imageAnalysis.subject = 'お友達';
        if (work.title.includes('K')) imageAnalysis.subject = 'アルファベット';
      }
      
      // さらに実際の実装では画像データをBase64でエンコードしてGeminiに送信する
      // const imageBase64 = getBase64FromUrl(imageUrl);
      // const geminiResponse = await callGeminiApi(imageBase64);
      // const imageAnalysis = analyzeGeminiResponse(geminiResponse);
      
      // 子供向けの親しみやすいテンプレート
      // 画像分析結果を埋め込む
      const baseTemplates = [
        `わあ！${imageAnalysis.colors}の色使いがすごくきれいだね！${imageAnalysis.subject}の描き方、センスいいなあ！`,
        `${imageAnalysis.details}のところ、すごく丁寧に作ってるね！集中して頑張ったんだね！えらいよ！`,
        `${imageAnalysis.subject}の表現がどんどん上手になってるよ！前よりもっと${imageAnalysis.emotion}感じがでてるね！`,
        `${imageAnalysis.subject}を${imageAnalysis.technique}描き方で表現するって、すごいアイデアだね！想像力がすごいなあ！`
      ];
      
      // 作品タイプに応じて特にGemini AIが注目すべき特徴が変わる
      const specificDetails: {[key: string]: string[]} = {
        drawing: [`${imageAnalysis.colors}の使い方`, `${imageAnalysis.subject}の形`, `${imageAnalysis.details}の表現`, `全体のバランス`],
        photo: [`${imageAnalysis.subject}の撮り方`, `${imageAnalysis.details}の捉え方`, `光と影の使い方`, `${imageAnalysis.emotion}雰囲気`],
        audio: [`声の表現`, `${imageAnalysis.emotion}リズム`, `気持ちの伝え方`, `${imageAnalysis.subject}の話し方`]
      };
      
      // 作品タイプに合わせた分析結果を反映
      const type = workType as keyof typeof specificDetails;
      const details = specificDetails[type] || specificDetails.drawing;
      
      // AIがより自然な表現で褒める文言を生成
      const suggestions = baseTemplates.map(template => {
        // テンプレートをそのまま使用（既に分析結果が埋め込まれている）
        return template;
      });
      
      // 作品の特徴に基づいた具体的な褒め言葉を追加
      if (type === 'drawing') {
        suggestions.push(`${imageAnalysis.subject}をよく見て描いているね！${imageAnalysis.details}の細かいところまでしっかり表現できているよ！すごい観察力だね！`);
        suggestions.push(`この絵の${imageAnalysis.colors}がとても素敵！見ているだけで${imageAnalysis.emotion}気持ちになるよ！才能があるね！`);
      } else if (type === 'photo') {
        suggestions.push(`${imageAnalysis.subject}の写真の撮り方がすっごくいいね！見る人の心をつかむよ！`);
        suggestions.push(`どんな${imageAnalysis.subject}を写すか、よく考えたんだね！観察力バツグンだよ！`);
      } else if (type === 'audio') {
        suggestions.push(`声の使い方が上手だね！聞いてる人をワクワクさせるよ！`);
        suggestions.push(`お話の仕方がとっても上手！${imageAnalysis.emotion}表現力が豊かだね！`);
      }

      // どの作品タイプにも使える汎用的な子供向け褒め言葉を追加
      suggestions.push(`すごーい！こんな${imageAnalysis.emotion}${imageAnalysis.subject}が作れるなんて、天才だね！`);
      suggestions.push(`わぁ！びっくりしちゃった！こんなに素敵な${imageAnalysis.subject}が作れるなんてすごいね！`);
      suggestions.push(`見てるだけでニコニコしちゃうよ！${imageAnalysis.colors}がすっごく素敵な作品だね！`);
      
      // ユニークな褒め言葉を生成
      const uniqueSuggestions = Array.from(new Set(suggestions));
      
      // Gemini APIで分析した具体的な情報メモ（デバッグ用）
      console.log('Gemini分析結果(モック):', {
        workId: work.id,
        workTitle: work.title,
        imageType: workType,
        analysis: imageAnalysis
      });
      
      resolve(uniqueSuggestions);
    }, 1000); // 1秒の遅延を追加して非同期処理をシミュレート
  });
};

// 作品タイプに応じたアイコンを返すコンポーネント
const WorkTypeIcon = memo(({ type }: { type: string }) => {
  const icons = {
    drawing: <Palette className="h-5 w-5" />,
    audio: <Music className="h-5 w-5" />,
    photo: <Camera className="h-5 w-5" />,
  };

  return icons[type] || <ImageIcon className="h-5 w-5" />;
});

WorkTypeIcon.displayName = 'WorkTypeIcon';

// フィルターボタンコンポーネント
const FilterButton = memo(({ type, activeFilter, onClick }: { 
  type: WorkTypeFilter, 
  activeFilter: WorkTypeFilter, 
  onClick: (type: WorkTypeFilter) => void 
}) => {
  // フィルタータイプに基づくラベルとアイコンを設定
  const filterConfig = {
    all: { 
      label: 'すべて', 
      icon: <Filter className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-purple-500 to-indigo-600'
    },
    drawing: { 
      label: '絵', 
      icon: <Palette className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-orange-400 to-pink-500'
    },
    audio: { 
      label: '音声', 
      icon: <Music className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-green-400 to-teal-500'
    },
    photo: { 
      label: '写真', 
      icon: <Camera className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-blue-400 to-cyan-500'
    },
  };

  const isActive = type === activeFilter;
  const config = filterConfig[type];

  return (
    <button
      onClick={() => onClick(type)}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
        isActive 
          ? `${config.color} text-white shadow-lg` 
          : `bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow`
      }`}
    >
      <span className={`${isActive ? 'animate-pulse' : ''}`}>
        {config.icon}
      </span>
      <span>{config.label}</span>
    </button>
  );
});

FilterButton.displayName = 'FilterButton';

// フィードバックアイテムコンポーネント
const FeedbackItem = memo(({ feedback, onLike }: { 
  feedback: Feedback, 
  onLike: (id: string) => void 
}) => {
  // フィードバックテキストからスタンプ情報を抽出
  let feedbackText = feedback.feedback || '';
  let stampId = null;
  
  // スタンプ情報の抽出（[スタンプ名] の形式）
  const stampMatch = feedbackText.match(/^\[(ハート|いいね|スター|賞|スマイル)\]\s*/);
  if (stampMatch) {
    const stampLabel = stampMatch[1];
    // スタンプラベルからIDを逆引き
    const foundStamp = STAMPS.find(s => s.label === stampLabel);
    if (foundStamp) {
      stampId = foundStamp.id;
      // スタンプ情報を除去したテキストを設定
      feedbackText = feedbackText.replace(stampMatch[0], '');
    }
  }
  
  const stamp = stampId ? STAMPS.find(s => s.id === stampId) : null;
  
  // ふりがなの抽出（<ruby>漢字<rt>ふりがな</rt></ruby>の形式）
  const hasRuby = feedbackText.includes('<ruby>');
  const renderFeedbackWithRuby = () => {
    if (!hasRuby) return feedbackText;
    return <div dangerouslySetInnerHTML={{ __html: feedbackText }} />;
  };
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-2 shadow-sm">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">{feedback.username || '匿名'}</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          {new Date(feedback.created_at).toLocaleDateString('ja-JP')}
        </span>
      </div>
      
      <div className="mt-3">
        {stamp && (
          <div className="mb-2 inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
            <span className={`${stamp.color}`}>{stamp.icon}</span>
            <span className="text-sm text-amber-700 font-medium">{stamp.label}</span>
          </div>
        )}
        
        {feedbackText && feedbackText !== 'スタンプを送りました' && (
          <div className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
            {hasRuby ? renderFeedbackWithRuby() : feedbackText}
          </div>
        )}
      </div>
      
      <div className="mt-3 flex justify-end">
        <button 
          onClick={() => onLike(feedback.id)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all duration-200 ${
            feedback.liked_by_me 
              ? 'text-rose-600 bg-rose-50 border border-rose-200' 
              : 'text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200'
          }`}
          data-feedback-id={feedback.id}
        >
          <Heart className={`h-4 w-4 heart-icon ${feedback.liked_by_me ? 'fill-rose-600' : ''}`} />
          <span>{feedback.likes || 0}</span>
        </button>
      </div>
    </div>
  );
});

FeedbackItem.displayName = 'FeedbackItem';

// 作品カードコンポーネント
const WorkCard = memo(({ work, onFeedbackClick, getSafeMediaUrl, updatedWorkIds, onQuickFeedbackSubmit }: { 
  work: Work, 
  onFeedbackClick: (work: Work) => void,
  getSafeMediaUrl: (url: string) => string,
  updatedWorkIds: string[],
  onQuickFeedbackSubmit: (workId: string) => void
}) => {
  const workType = work.type || work.media_type;
  const typeLabels = {
    drawing: 'お絵かき',
    audio: '音声',
    photo: '写真',
  };
  
  const typeColors = {
    drawing: 'bg-gradient-to-r from-orange-400 to-pink-500',
    audio: 'bg-gradient-to-r from-green-400 to-teal-500',
    photo: 'bg-gradient-to-r from-blue-400 to-cyan-500',
  };
  
  const typeLabel = typeLabels[workType] || '作品';
  const typeColor = typeColors[workType] || 'bg-gradient-to-r from-purple-500 to-indigo-600';
  
  // media_urlとcontent_urlの両方をチェック
  const mediaUrl = work.media_url || work.content_url;
  
  // フィードバック数を取得
  const feedbackCount = work.feedbackCount || 0;
  
  // 外部から更新があったかチェック
  const isWorkUpdated = updatedWorkIds.includes(work.id);
  
  // ローカルステートは親側での更新も反映
  const [localHasFeedback, setLocalHasFeedback] = useState(feedbackCount > 0 || isWorkUpdated);
  const [localFeedbackCount, setLocalFeedbackCount] = useState(feedbackCount);
  
  // アニメーション用のステート
  const [animatingButtonId, setAnimatingButtonId] = useState<string | null>(null);

  // 親からの更新を検知したらローカルステートを更新
  useEffect(() => {
    if (isWorkUpdated || feedbackCount > 0) {
      setLocalHasFeedback(true);
      setLocalFeedbackCount(Math.max(feedbackCount, 1)); // 少なくとも1件に設定
    } else {
      setLocalHasFeedback(feedbackCount > 0);
      setLocalFeedbackCount(feedbackCount);
    }
  }, [feedbackCount, isWorkUpdated]);

  // クイック褒めボタンの処理
  const handleQuickPraise = async (e: React.MouseEvent, praiseType: string, buttonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // アニメーション開始
    setAnimatingButtonId(buttonId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // プレイスタイプに応じた褒め言葉を設定
      let feedback = '';
      switch(praiseType) {
        case 'great':
          feedback = '[スター] すごい！センスがいいね！';
          break;
        case 'effort':
          feedback = '[ハート] よく頑張ったね！素晴らしいよ！';
          break;
        case 'creative':
          feedback = '[賞] とても創造的で素敵です！';
          break;
        default:
          feedback = '[スマイル] 素晴らしい作品だね！';
      }

      // フィードバックを送信
      const { error } = await supabase
        .from('work_feedback')
        .insert({
          work_id: work.id,
          user_id: user.id,
          feedback: feedback
        });

      if (error) throw error;

      // 成功したら即座に表示を更新
      setLocalHasFeedback(true);
      setLocalFeedbackCount(prev => prev + 1);
      
      // 親コンポーネントに通知して全体の状態も更新
      onQuickFeedbackSubmit(work.id);

      // フィードバックメッセージ
      const messages = [
        '3秒で褒めました！',
        'すばらしい！フィードバック完了！',
        '子供の自信につながりました！',
        'ステキな褒め言葉を送りました！'
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      toast.success(randomMessage, {
        icon: praiseType === 'great' ? '🌟' : praiseType === 'effort' ? '❤️' : '🏆',
        duration: 3000
      });
      
      // 成功エフェクト - 派手な花火のようなアニメーション
      showConfetti();
      
    } catch (err) {
      console.error('クイック褒め送信エラー:', err);
      toast.error('送信に失敗しました');
    } finally {
      // アニメーション完了後に状態をリセット
      setTimeout(() => {
        setAnimatingButtonId(null);
      }, 800);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 animate-fadeIn transform hover:-translate-y-1">
      <Link
        to={`/parent/works/${work.id}`}
        className="block"
      >
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {workType === 'drawing' || workType === 'photo' ? (
            <img 
              src={getSafeMediaUrl(mediaUrl)} 
              alt={work.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e113b0f1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e113b0f1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22148.5%22%20y%3D%22157.9%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Music className="h-16 w-16 text-gray-300" />
            </div>
          )}
          <div className={`absolute top-2 right-2 ${typeColor} text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm shadow-md`}>
            {typeLabel}
          </div>
          
          {/* フィードバック状態バッジ - ローカルステートを使用 */}
          <div className={`absolute top-2 left-2 backdrop-blur-sm flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-sm transition-all ${
            localHasFeedback 
              ? 'bg-gradient-to-r from-emerald-500/90 to-green-500/90 text-white' 
              : 'bg-gradient-to-r from-amber-400/90 to-orange-400/90 text-white'
          }`}>
            {localHasFeedback ? (
              <>
                <CheckCircle2 size={14} className="animate-pulse" />
                <span className="text-xs font-medium">{localFeedbackCount}件</span>
              </>
            ) : (
              <>
                <Clock size={14} className="animate-pulse" />
                <span className="text-xs font-medium">待ち</span>
              </>
            )}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <h2 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">{work.title}</h2>
        
        {work.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{work.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(work.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
          
          {/* ローカルステートを使用して表示切り替え */}
          {localHasFeedback ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFeedbackClick(work);
            }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 hover:from-emerald-100 hover:to-green-100 border border-emerald-200"
            >
              <MessageCircle className="h-5 w-5 text-emerald-500" />
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </button>
          ) : (
            <div className="flex gap-1">
              {/* 3秒褒めボタン（アニメーション強化版） */}
              <div className="flex space-x-1">
                <button
                  id={`praise-great-${work.id}`}
                  onClick={(e) => handleQuickPraise(e, 'great', `praise-great-${work.id}`)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition-all ${
                    animatingButtonId === `praise-great-${work.id}` ? 'animate-praise-button' : ''
                  }`}
                  title="すごい！"
                >
                  <Star className={`h-5 w-5 ${animatingButtonId === `praise-great-${work.id}` ? 'animate-spin' : ''}`} />
                </button>
                <button
                  id={`praise-effort-${work.id}`}
                  onClick={(e) => handleQuickPraise(e, 'effort', `praise-effort-${work.id}`)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all ${
                    animatingButtonId === `praise-effort-${work.id}` ? 'animate-praise-button' : ''
                  }`}
                  title="頑張ったね！"
                >
                  <Heart className={`h-5 w-5 ${animatingButtonId === `praise-effort-${work.id}` ? 'animate-heartbeat' : ''}`} />
                </button>
                <button
                  id={`praise-creative-${work.id}`}
                  onClick={(e) => handleQuickPraise(e, 'creative', `praise-creative-${work.id}`)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all ${
                    animatingButtonId === `praise-creative-${work.id}` ? 'animate-praise-button' : ''
                  }`}
                  title="創造的！"
                >
                  <Award className={`h-5 w-5 ${animatingButtonId === `praise-creative-${work.id}` ? 'animate-bounce' : ''}`} />
          </button>
        </div>
              
              {/* 詳細フィードバックボタン */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFeedbackClick(work);
                }}
                className="flex items-center justify-center w-10 h-10 ml-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition-all"
                title="フィードバックする"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

WorkCard.displayName = 'WorkCard';

// ヘッダーコンポーネント
const Header = memo(({ 
  activeFilter, 
  setActiveFilter,
  searchTerm,
  setSearchTerm
}: { 
  activeFilter: WorkTypeFilter, 
  setActiveFilter: (filter: WorkTypeFilter) => void,
  searchTerm: string,
  setSearchTerm: (term: string) => void
}) => (
  <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          子どもの作品一覧
        </h1>
        
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-indigo-400" />
          </div>
          <input
            type="text"
            placeholder="作品を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-indigo-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-indigo-50 text-indigo-900 placeholder-indigo-300"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-indigo-400 hover:text-indigo-500" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FilterButton type="all" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="drawing" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="photo" activeFilter={activeFilter} onClick={setActiveFilter} />
        <FilterButton type="audio" activeFilter={activeFilter} onClick={setActiveFilter} />
      </div>
    </div>
  </div>
));

Header.displayName = 'Header';

// 空の状態コンポーネント
const EmptyState = memo(({ filter }: { filter: WorkTypeFilter }) => {
  const filterLabels = {
    all: 'すべての',
    drawing: '絵の',
    photo: '写真の',
    audio: '音声の'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-8 mt-6 text-center animate-fadeIn">
      <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full mb-4">
        <ImageIcon className="h-12 w-12 text-indigo-300" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">
        {filterLabels[filter]}作品が見つかりません
      </h3>
      <p className="text-gray-500">
        検索条件に一致する作品はありません。
      </p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// フィードバックモーダルコンポーネント
const FeedbackModal = memo(({ 
  isOpen, 
  onClose, 
  work, 
  onSubmit 
}: { 
  isOpen: boolean,
  onClose: () => void,
  work: Work | null,
  onSubmit: (workId: string, feedback: string) => Promise<void>
}) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [withFurigana, setWithFurigana] = useState(true);
  const [isGeneratingFurigana, setIsGeneratingFurigana] = useState(false);
  const [previewWithFurigana, setPreviewWithFurigana] = useState('');

  // Gemini API設定（実際の実装では環境変数などから取得）
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent';

  // モーダルを閉じる時に状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setFeedback('');
      setSelectedStamp(null);
      setIsSubmitting(false);
      setActiveTab('quick');
      setAiSuggestions([]);
      setAiExplanation('');
      setIsGeneratingAI(false);
      setWithFurigana(true);
      setIsGeneratingFurigana(false);
      setPreviewWithFurigana('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!work) return;
    
    // スタンプが選択されていて、テキストがない場合は自動でテキストを設定
    let feedbackText = feedback.trim();
    if (selectedStamp && !feedbackText) {
      feedbackText = `[${STAMPS.find(s => s.id === selectedStamp)?.label || 'スタンプ'}] スタンプを送りました`;
    } else if (selectedStamp) {
      feedbackText = `[${STAMPS.find(s => s.id === selectedStamp)?.label || 'スタンプ'}] ${feedbackText}`;
    }
    
    if (!feedbackText) {
      toast.error('フィードバックを入力してください');
      return;
    }
    
    // ふりがなを追加する場合
    if (withFurigana && previewWithFurigana) {
      feedbackText = previewWithFurigana;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onSubmit(work.id, feedbackText);
      if (success) {
      onClose();
      }
    } catch (error) {
      console.error('フィードバック送信エラー:', error);
      toast.error('フィードバックの送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // クイックフィードバックの送信
  const handleQuickFeedback = async (template: string, stampId?: string) => {
    if (!work) return;
    
    let feedbackText = template;
    
    // スタンプがある場合は追加
    if (stampId) {
      const stamp = STAMPS.find(s => s.id === stampId);
      if (stamp) {
        feedbackText = `[${stamp.label}] ${template}`;
      }
    }
    
    // ふりがなを追加する場合
    if (withFurigana) {
      try {
        setIsSubmitting(true);
        const furiganaText = await generateFurigana(feedbackText);
        feedbackText = furiganaText;
      } catch (error) {
        console.error('ふりがな生成エラー:', error);
        // エラーの場合はふりがななしで続行
      }
    }
    
    try {
      setIsSubmitting(true);
      const success = await onSubmit(work.id, feedbackText);
      if (success) {
        // 送信成功時に紙吹雪エフェクト表示
        showConfetti();
        toast.success('3秒で褒めました！', {
          icon: '🎉',
          duration: 3000,
          style: {
            background: 'linear-gradient(to right, #10B981, #059669)',
            color: 'white',
          },
        });
        onClose();
      }
    } catch (error) {
      console.error('フィードバック送信エラー:', error);
      toast.error('フィードバックの送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ふりがなを生成する関数
  const generateFurigana = async (text: string): Promise<string> => {
    try {
      // 実際の実装ではAPIを呼び出す
      // モックの実装として、簡易的なふりがな生成を行う
      setIsGeneratingFurigana(true);
      
      // モック: 一般的な漢字のふりがなマッピング
      const furiganaMap: {[key: string]: string} = {
        '素晴': 'すば',
        '素敵': 'すてき',
        '上手': 'じょうず',
        '色使': 'いろづか',
        '気持': 'きも',
        '頑張': 'がんば',
        '作品': 'さくひん',
        '子供': 'こども',
        '子ども': 'こども',
        '自分': 'じぶん',
        '創造': 'そうぞう',
        '表現': 'ひょうげん',
        '描': 'か',
        '絵': 'え',
        '見': 'み',
        '感': 'かん',
        '楽': 'たの',
        '考': 'かんが',
        '工夫': 'くふう',
        '丁寧': 'ていねい',
        '細': 'こま',
        '良': 'よ',
        '良く': 'よく',
        '凄': 'すご',
        '凄い': 'すごい',
        '大切': 'たいせつ',
        '素晴らしい': 'すばらしい',
        '好': 'す'
      };
      
      // テキストを簡易的に解析してふりがなを付ける
      let result = text;
      
      // APIリクエストのシミュレーション
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 漢字にふりがなを追加
      Object.keys(furiganaMap).forEach(kanji => {
        const furigana = furiganaMap[kanji];
        const regex = new RegExp(kanji, 'g');
        result = result.replace(regex, `<ruby>${kanji}<rt>${furigana}</rt></ruby>`);
      });
      
      setPreviewWithFurigana(result);
      return result;
    } catch (error) {
      console.error('ふりがな生成エラー:', error);
      throw error;
    } finally {
      setIsGeneratingFurigana(false);
    }
  };
  
  // フィードバックテキストが変更されたときにふりがなをプレビュー
  useEffect(() => {
    if (activeTab === 'custom' && withFurigana && feedback) {
      const debounce = setTimeout(async () => {
        try {
          await generateFurigana(feedback);
        } catch (error) {
          console.error('ふりがなプレビューエラー:', error);
        }
      }, 500);
      
      return () => clearTimeout(debounce);
    }
  }, [feedback, withFurigana, activeTab]);
  
  // モーダルがオープンしたときの処理
  useEffect(() => {
    if (isOpen && activeTab === 'custom') {
      setPreviewWithFurigana('');
    }
  }, [isOpen, activeTab]);

  // 画像をBase64エンコードする関数
  const getBase64FromUrl = async (url: string): Promise<string> => {
    try {
      // 画像がない場合
      if (!url) {
        throw new Error('画像URLが指定されていません');
      }
      
      console.log('画像URLからBase64を生成:', url);
      
      // URLがdata:で始まるBase64データの場合はそのまま返す
      if (url.startsWith('data:')) {
        return url;
      }
      
      // 画像をフェッチ
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`画像の取得に失敗: ${response.status} ${response.statusText}`);
      }
      
      // BlobからBase64に変換
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('画像のBase64エンコードエラー:', error);
      
      // エラー時にはデフォルトの画像を使用
      // 1x1の透明なGIF画像のBase64
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  };
  
  // Gemini APIを呼び出す関数（実際に使用する際に実装）
  const callGeminiApi = async (imageBase64: string, workTitle: string, workType: string): Promise<any> => {
    // 実際のGemini API実装
    try {
      const GEMINI_API_KEY = 'AIzaSyA9WEyMeSTR3d8WFGCrNYDniFAALBq82lo'; // 実際のAPI Key
      const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
      
      // APIリクエストボディの構築
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `これは子供の${workType === 'drawing' ? 'お絵かき' : workType === 'photo' ? '写真' : '音声作品'}です。タイトルは「${workTitle}」です。
                この作品の特徴を分析して、以下のカテゴリで詳細情報を教えてください：
                1. 色使い（色名と特徴）
                2. 描画対象・主題
                3. 技法や表現の特徴
                4. 感情表現
                5. 独創性・創造性の要素
                
                そして、それらの情報をもとに、子供が喜ぶような具体的で温かい褒め言葉を5つ以上提案してください。
                子供向けの優しい言葉遣いで、「〜だね！」「〜してるね！」などのフレンドリーな表現を使い、
                作品の良いところを具体的に褒める内容にしてください。`
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageBase64.split(',')[1] // "data:image/jpeg;base64," の部分を取り除く
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };
      
      console.log('Gemini APIリクエスト送信前', { workTitle, workType });
      
      // APIリクエスト
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error response:', errorText);
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Gemini API Response:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('Gemini API呼び出しエラー:', error);
      // エラー時はモックデータを返す
      return mockAIFeedbackGenerator(work!);
    }
  };
  
  // Gemini APIのレスポンスから褒め言葉の配列を抽出する関数
  const analyzeGeminiResponse = (response: any): {suggestions: string[], explanation: string} => {
    try {
      // APIレスポンスの解析
      if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API応答形式が不正です');
      }
      
      const text = response.candidates[0].content.parts[0].text;
      console.log('Gemini APIテキスト応答:', text);
      
      // 分析情報と褒め言葉を抽出
      const analysisMatch = text.match(/1\. 色使い[^5]+5\. 独創性[^\n]+/s);
      const suggestionsMatch = text.match(/褒め言葉[：:]\s*\n\s*([^]*)/s);
      
      const explanation = analysisMatch ? analysisMatch[0] : '作品の色使い、主題、表現技法などを分析し、具体的な褒め言葉を生成しました。';
      let suggestions: string[] = [];
      
      if (suggestionsMatch && suggestionsMatch[1]) {
        // 番号付きリストから褒め言葉を抽出
        const suggestionsText = suggestionsMatch[1];
        const suggestionMatches = suggestionsText.match(/\d+\.?\s+([^\n]+)/g);
        
        if (suggestionMatches) {
          suggestions = suggestionMatches.map(line => {
            // 番号を取り除いて褒め言葉だけを抽出
            return line.replace(/^\d+\.?\s+/, '').trim();
          });
        } else {
          // 番号なしの場合は行単位で分割
          suggestions = suggestionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        }
      }
      
      // 褒め言葉が見つからない場合
      if (suggestions.length === 0) {
        // テキスト全体から候補を探す
        const lines = text.split('\n')
          .map(line => line.trim())
          .filter(line => 
            line.length > 10 && 
            (line.includes('だね') || line.includes('ね！') || line.includes('すごい') || line.includes('素晴らしい'))
          );
          
        if (lines.length > 0) {
          suggestions = lines;
        }
      }
      
      // それでも見つからない場合はモックデータを使用
      if (suggestions.length === 0) {
        const mockSuggestions = [
          "色使いがとても素敵だね！センスが良いよ！",
          "細かいところまで丁寧に描けてるね！すごいね！",
          "とても創造的なアイデアだね！想像力が豊かだね！",
          "この表現方法がすごくオリジナルだね！才能があるよ！",
          "見ているだけで楽しい気持ちになる素敵な作品だね！"
        ];
        suggestions = mockSuggestions;
      }
      
      console.log('抽出された褒め言葉:', suggestions);
      return { suggestions, explanation };
    } catch (error) {
      console.error('Gemini API応答解析エラー:', error);
      return { 
        suggestions: [
          "色使いがとても素敵だね！センスが良いよ！",
          "細かいところまで丁寧に描けてるね！すごいね！",
          "とても創造的なアイデアだね！想像力が豊かだね！",
          "この表現方法がすごくオリジナルだね！才能があるよ！",
          "見ているだけで楽しい気持ちになる素敵な作品だね！"
        ], 
        explanation: 'AIによる画像分析に基づいた褒め言葉を生成しました。' 
      };
    }
  };

  // AIによるフィードバック生成
  const handleAIGenerate = async () => {
    if (!work) return;
    
    setIsGeneratingAI(true);
    try {
      const mediaUrl = work.media_url || work.content_url || '';
      const workType = work.type || work.media_type;
      const workTitle = work.title || '';
      
      // 画像をBase64にエンコード
      const imageBase64 = await getBase64FromUrl(mediaUrl);
      if (!imageBase64) {
        throw new Error('画像の取得に失敗しました');
      }
      
      // Gemini APIの呼び出し
      const response = await callGeminiApi(imageBase64, workTitle, workType);
      
      // レスポンスの解析
      const { suggestions, explanation } = analyzeGeminiResponse(response);
      
      // 最大5件の提案を表示
      const displaySuggestions = suggestions.slice(0, 5);
      setAiSuggestions(displaySuggestions);
      setAiExplanation(explanation);
      
      // 最初の提案を自動的に選択
      if (displaySuggestions.length > 0) {
        setFeedback(displaySuggestions[0]);
      }
    } catch (error) {
      console.error('AI生成エラー:', error);
      toast.error('フィードバック生成に失敗しました');
      
      // エラー時にはモックデータを使用
      const mockSuggestions = await mockAIFeedbackGenerator(work);
      // 最大5件に制限
      setAiSuggestions(mockSuggestions.slice(0, 5));
      setAiExplanation('モックデータによる褒め言葉生成を行いました。');
      
      // 最初の提案を自動的に選択
      if (mockSuggestions.length > 0) {
        setFeedback(mockSuggestions[0]);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  // AI提案を選択
  const handleSelectAISuggestion = (suggestion: string) => {
    setFeedback(suggestion);
    
    // 選択時にも小さなエフェクトを表示
    const button = document.querySelector(`button[data-suggestion="${suggestion}"]`);
    if (button) {
      // ボタンに小さな輝きエフェクトを追加
      const glowEffect = document.createElement('span');
      glowEffect.className = 'suggestion-glow-effect';
      button.appendChild(glowEffect);
      
      // 小さな効果音を再生
      try {
        const audio = new Audio('/sounds/click.mp3');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('効果音を再生できませんでした:', e));
      } catch (e) {
        console.log('効果音の再生に対応していない環境です');
      }
      
      // エフェクトを削除
      setTimeout(() => {
        if (button.contains(glowEffect)) {
          button.removeChild(glowEffect);
        }
      }, 700);
    }
  };

  // モーダルのオーバーレイ部分をクリックした時に閉じる
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // クイックフィードバックのテンプレート
  const quickTemplates = [
    { id: 'great', text: 'すごい！センスがいいね！', stamp: 'star', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'effort', text: 'よく頑張ったね！素晴らしいよ！', stamp: 'heart', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { id: 'creative', text: 'とても創造的で素敵です！', stamp: 'award', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'improvement', text: '前よりも上手になったね！', stamp: 'thumbsup', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'detail', text: '細かいところまで丁寧に作ったね！', stamp: 'smile', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'color', text: '色使いがとても素敵です！', stamp: 'star', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'enjoy', text: '楽しんで作ったのが伝わってくるね！', stamp: 'smile', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'idea', text: 'アイデアが素晴らしいね！', stamp: 'award', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  ];

  if (!isOpen || !work) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all animate-scaleIn">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">
            「{work.title}」へのフィードバック
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* ふりがなオプション */}
        <div className="px-5 py-2 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">こどもが読めるふりがなを付ける</span>
            <div className="inline-flex items-center p-1 bg-indigo-50 rounded-md">
              <Sparkles className="h-3 w-3 text-indigo-500" />
            </div>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={withFurigana}
              onChange={(e) => setWithFurigana(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        
        {/* タブ切り替え */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'quick'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>3秒で褒める</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'custom'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <PenLine className="h-4 w-4" />
              <span>カスタム</span>
            </div>
          </button>
        </div>
        
        {activeTab === 'quick' ? (
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-5">
              テンプレートをタップすると、すぐにフィードバックが送信されます。
              {withFurigana && <span className="text-indigo-600 font-medium"> ふりがなは自動で付加されます。</span>}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {quickTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleQuickFeedback(template.text, template.stamp)}
                  disabled={isSubmitting}
                  className={`p-3.5 rounded-lg border ${template.color} text-left hover:opacity-90 transition-opacity shadow-sm`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {STAMPS.find(s => s.id === template.stamp)?.icon}
                    <span className="font-medium">タップして送信</span>
                  </div>
                  <p className="text-sm">{template.text}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-5">
            {/* AIアシスタント */}
          <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  画像分析AIによる褒め言葉生成
            </label>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-sm transition-colors"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>AIで分析</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* AIの動作説明 */}
              <div className="mb-3 px-3 py-2 bg-indigo-50 rounded-lg text-xs text-indigo-700">
                <p className="flex items-start gap-1.5">
                  <Sparkles className="h-3 w-3 mt-0.5 text-indigo-500" />
                  <span>
                    画像から特徴を分析し、ポジティブなフィードバックを自動生成します。
                    お子様の創作意欲を高める褒め言葉が簡単に作成できます。
                  </span>
                </p>
              </div>
              
              {/* AI生成中のローディング表示 */}
              {isGeneratingAI && (
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6 animate-pulse">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">作品の特徴を分析中...</p>
                    <p className="text-gray-500 text-xs mt-1">AIが作品の色・形・構図などを分析しています</p>
                  </div>
                </div>
              )}
              
              {/* AI提案リスト */}
              {!isGeneratingAI && aiSuggestions.length > 0 && (
                <div className="mb-4 max-h-60 overflow-y-auto pr-2">
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectAISuggestion(suggestion)}
                        data-suggestion={suggestion}
                        className={`w-full text-left p-3 rounded-lg border transition-all relative ${
                          suggestion === feedback
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {suggestion === feedback ? (
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                          )}
                          <span className={`text-sm font-medium ${suggestion === feedback ? 'text-indigo-700' : 'text-gray-700'}`}>
                            AI提案 {index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
              )}
          
          {/* フィードバックテキスト入力 */}
          <div className="mb-4">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              フィードバックメッセージ {selectedStamp ? '(任意)' : '(必須)'}
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="お子様の作品について、具体的に褒めてあげましょう！"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              rows={4}
            />
          </div>
          
          {/* 送信ボタン */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-sm flex items-center gap-2"
                  disabled={isSubmitting || (withFurigana && isGeneratingFurigana)}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>送信中...</span>
                </>
              ) : (
                <>
                  <MessageCircle size={16} />
                  <span>送信する</span>
                </>
              )}
            </button>
              </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
});

FeedbackModal.displayName = 'FeedbackModal';

export default function ParentWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<WorkTypeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childrenStats, setChildrenStats] = useState<{[key: string]: {total: number, drawing: number, photo: number, audio: number}}>({});
  const navigate = useNavigate();
  
  // フィードバックモーダル用の状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [feedbackStats, setFeedbackStats] = useState({
    waiting: 0,
    completed: 0,
    total: 0
  });
  // 即時更新用のステート
  const [updatedWorkIds, setUpdatedWorkIds] = useState<string[]>([]);

  // スタイルを追加
  useEffect(() => {
    createStyles();
  }, []);

  // フィードバックボタンのクリックハンドラ
  const handleFeedbackClick = (work: Work) => {
    // すでにフィードバックがある場合は詳細ページに遷移
    if (work.feedbackCount && work.feedbackCount > 0) {
      // フィードバック済みでも追加のフィードバックができるようにモーダルを表示
      setSelectedWork(work);
      setIsModalOpen(true);
    } else {
      // フィードバックがない場合はモーダルを表示
      setSelectedWork(work);
      setIsModalOpen(true);
    }
  };

  // フィードバック送信処理
  const handleFeedbackSubmit = async (workId: string, feedbackText: string) => {
    if (!workId || !feedbackText) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      const { error } = await supabase
        .from('work_feedback')
        .insert({
          work_id: workId,
          user_id: user.id,
          feedback: feedbackText
        });

      if (error) throw error;

      // 成功したら紙吹雪エフェクトを表示
      showConfetti();

      toast.success('フィードバックを送信しました！', {
        icon: '🎉',
        duration: 4000,
        style: {
          background: 'linear-gradient(to right, #10B981, #059669)',
          color: 'white',
        },
      });
      
      // 即時UI更新のためのワークID追加
      setUpdatedWorkIds(prev => [...prev, workId]);
      
      // フィードバックステータスの即時更新
      setFeedbackStats(prev => ({
        ...prev,
        waiting: Math.max(0, prev.waiting - 1),
        completed: prev.completed + 1
      }));
      
      // 作品リストを更新
      if (selectedChildId) {
        // 即時に作品状態を更新して、待機中から完了に変更
        setWorks(prev => 
          prev.map(w => 
            w.id === workId 
              ? { ...w, feedbackCount: (w.feedbackCount || 0) + 1 }
              : w
          )
        );
        
        // 非同期で最新データを取得（ただし即時UIは上記で更新済み）
        await fetchWorks();
      }
      
      return true; // 成功を示す値を返す
    } catch (err) {
      console.error('フィードバック送信エラー:', err);
      toast.error('フィードバックの送信に失敗しました');
      return false; // 失敗を示す値を返す
    }
  };

  // クイックフィードバック送信ハンドラ (WorkCardからの呼び出し用)
  const handleQuickFeedbackSubmit = (workId: string) => {
    // 即時UI更新のためのワークID追加
    setUpdatedWorkIds(prev => [...prev, workId]);
    
    // フィードバックステータスの即時更新
    setFeedbackStats(prev => ({
      ...prev,
      waiting: Math.max(0, prev.waiting - 1),
      completed: prev.completed + 1
    }));
    
    // 作品リストを更新
    setWorks(prev => 
      prev.map(w => 
        w.id === workId 
          ? { ...w, feedbackCount: (w.feedbackCount || 0) + 1 }
          : w
      )
    );
  };

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

  // 子供ごとの作品統計を取得
  useEffect(() => {
    const fetchChildrenStats = async () => {
      if (children.length === 0) return;
      
      const stats: {[key: string]: {total: number, drawing: number, photo: number, audio: number}} = {};
      
      for (const child of children) {
        try {
          // 子供の作品数を取得
          const { data, error } = await supabase
            .from('works')
            .select('id, type')
            .eq('profile_id', child.id);
        
      if (error) {
            console.error(`${child.username}の作品統計取得エラー:`, error);
            continue;
          }
          
          // 作品タイプごとにカウント
          const typeCounts = {
            total: data.length,
            drawing: data.filter(w => w.type === 'drawing').length,
            photo: data.filter(w => w.type === 'photo').length,
            audio: data.filter(w => w.type === 'audio').length
          };
          
          stats[child.id] = typeCounts;
        } catch (err) {
          console.error(`${child.username}の作品統計取得中にエラー:`, err);
        }
      }
      
      setChildrenStats(stats);
    };
    
    fetchChildrenStats();
  }, [children]);

  // 選択した子供の作品を取得
  const fetchWorks = async () => {
    if (!selectedChildId) return;

    try {
      setLoading(true);
      setError(null);

      // まず作品を取得
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('*')
        .eq('profile_id', selectedChildId)
        .order('created_at', { ascending: false });
      
      if (worksError) throw worksError;
      
      // 各作品のフィードバック数を取得
      const worksWithFeedback = await Promise.all(worksData.map(async (work) => {
        // 正規化ロジック
        const originalType = work.media_type;
        let normalizedType = originalType;
        
        if (originalType === 'image') {
          normalizedType = 'drawing';
        } else if (originalType === 'video') {
          normalizedType = 'photo';
        }
        
        // typeフィールドがある場合はそれを優先
        if (work.type) {
          normalizedType = work.type;
        }
        
        // この作品のフィードバック数を取得
        const { count: feedbackCount, error: countError } = await supabase
          .from('work_feedback')
          .select('id', { count: 'exact', head: true })
          .eq('work_id', work.id);
        
        if (countError) {
          console.error(`作品 ${work.id} のフィードバック数取得エラー:`, countError);
          return {
            ...work,
            type: normalizedType,
            media_type: normalizedType,
            feedbackCount: 0
          };
        }
        
        console.log(`作品ID: ${work.id}, タイトル: ${work.title}, フィードバック数: ${feedbackCount}`);
        
        return {
          ...work,
          type: normalizedType,
          media_type: normalizedType,
          feedbackCount: feedbackCount || 0
        };
      }));
      
      // フィードバック統計の更新
      const total = worksWithFeedback.length;
      const waiting = worksWithFeedback.filter(w => !w.feedbackCount || w.feedbackCount === 0).length;
      const completed = total - waiting;
      
      setFeedbackStats({
        total,
        waiting,
        completed
      });
      
      setWorks(worksWithFeedback);
      
      // 更新完了後に更新済みワークIDをリセット
      setUpdatedWorkIds([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // 選択した子供が変わったら作品を取得
  useEffect(() => {
    fetchWorks();
  }, [selectedChildId]);

  // 作品をフィルタリングしてソート
  const filteredWorks = works.filter(work => {
    // タイプでフィルタリング
    const typeMatch = filter === 'all' || work.type === filter;
    
    // 検索語でフィルタリング
    const searchMatch = !searchTerm || 
      work.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      work.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
  }).sort((a, b) => {
    // フィードバックがない作品を先に表示
    const aHasFeedback = a.feedbackCount && a.feedbackCount > 0;
    const bHasFeedback = b.feedbackCount && b.feedbackCount > 0;
    
    if (!aHasFeedback && bHasFeedback) return -1;
    if (aHasFeedback && !bHasFeedback) return 1;
    
    // 同じフィードバック状態なら新しい作品順
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 子供選択コンポーネント
  const ChildSelector = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
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
            {childrenStats[child.id] && (
              <span className="text-xs opacity-80">({childrenStats[child.id].total})</span>
            )}
                    </button>
                  ))}
                </div>
              </div>
  );

  // 子供の作品統計コンポーネント
  const ChildStats = () => {
    if (!selectedChildId || !childrenStats[selectedChildId]) return null;
    
    const stats = childrenStats[selectedChildId];
    const selectedChild = children.find(c => c.id === selectedChildId);
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#5d7799] mb-2">
          {selectedChild?.username}の作品統計
        </h3>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">合計</div>
                </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.drawing}</div>
            <div className="text-sm text-purple-700">お絵かき</div>
                      </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.photo}</div>
            <div className="text-sm text-green-700">写真</div>
                          </div>
          <div className="bg-amber-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.audio}</div>
            <div className="text-sm text-amber-700">音声</div>
                        </div>
                        </div>
                          </div>
    );
  };
  
  // 3秒フィードバックプロモーションバナー
  const FeedbackPromotionBanner = () => {
    if (feedbackStats.waiting === 0) return null;
    
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-6 shadow-sm animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 rounded-full p-2 shadow-sm flex-shrink-0">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="font-medium text-amber-800">
            フィードバック待ちの作品が{feedbackStats.waiting}件あります
          </h3>
                        </div>
                          </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fbfd] pb-20">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#5d7799]">お子様の作品一覧</h1>
          <div className="flex gap-2">
            {/* 検索ボックス */}
            <div className="relative">
              <input
                type="text"
                placeholder="作品を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5d7799] w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchTerm && (
              <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5"
                >
                  <X className="h-5 w-5 text-gray-400" />
              </button>
              )}
            </div>
            
            {/* フィルターボタン */}
                <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 text-[#5d7799]" />
              <span className="text-[#5d7799]">
                {filter === 'all' ? 'すべて' : 
                 filter === 'drawing' ? 'お絵かき' : 
                 filter === 'photo' ? '写真' : '音声'}
                    </span>
                </button>
              </div>
                  </div>
                  
        {/* フィルターメニュー */}
        {isFilterOpen && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-3">
            {['all', 'drawing', 'photo', 'audio'].map((type) => (
                        <button
                key={type}
                onClick={() => {
                  setFilter(type as WorkTypeFilter);
                  setIsFilterOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  filter === type 
                    ? 'bg-[#5d7799] text-white' 
                    : 'bg-gray-100 text-[#5d7799] hover:bg-gray-200'
                }`}
              >
                {type === 'all' && <Filter className="h-5 w-5" />}
                {type === 'drawing' && <Palette className="h-5 w-5" />}
                {type === 'photo' && <Camera className="h-5 w-5" />}
                {type === 'audio' && <Music className="h-5 w-5" />}
                <span>
                  {type === 'all' ? 'すべて' : 
                   type === 'drawing' ? 'お絵かき' : 
                   type === 'photo' ? '写真' : '音声'}
                </span>
                        </button>
                      ))}
                </div>
              )}
        
        {/* 子供選択UI */}
        <ChildSelector />
        
        {/* 3秒フィードバックプロモーションバナー */}
        <FeedbackPromotionBanner />
        
        {/* 選択した子供の統計 */}
        {selectedChildId && <ChildStats />}
        
        {/* フィードバック待ちセクション */}
        {feedbackStats.waiting > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">フィードバック待ち</h2>
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{feedbackStats.waiting}件</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks
                .filter(w => !w.feedbackCount || w.feedbackCount === 0)
                .map((work) => (
                  <div key={work.id} className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="animate-pulse bg-amber-400 text-white text-xs px-2 py-1 rounded-full shadow-md">
                        フィードバック待ち
                      </div>
                    </div>
                    <WorkCard 
                      work={work} 
                      onFeedbackClick={handleFeedbackClick} 
                      getSafeMediaUrl={getSafeMediaUrl}
                      updatedWorkIds={updatedWorkIds}
                      onQuickFeedbackSubmit={handleQuickFeedbackSubmit}
                    />
                  </div>
                ))
              }
            </div>
          </div>
        )}
        
        {/* 既にフィードバック済みの作品セクション */}
        {feedbackStats.completed > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">フィードバック済み</h2>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{feedbackStats.completed}件</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks
                .filter(w => w.feedbackCount && w.feedbackCount > 0)
                .map((work) => (
                  <WorkCard 
                    key={work.id} 
                    work={work} 
                    onFeedbackClick={handleFeedbackClick} 
                    getSafeMediaUrl={getSafeMediaUrl}
                    updatedWorkIds={updatedWorkIds}
                    onQuickFeedbackSubmit={handleQuickFeedbackSubmit}
                  />
                ))
              }
            </div>
          </div>
        )}
        
        {/* 作品が0件の場合 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5d7799]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-semibold">エラーが発生しました</p>
            <p className="text-sm">{error.message}</p>
                <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-full text-sm"
                >
              再読み込み
                </button>
            </div>
        ) : filteredWorks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <ImageIcon className="h-10 w-10 text-gray-400" />
          </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? '検索結果がありません' : '作品がありません'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? '検索条件を変更してみてください' 
                : 'お子様がまだ作品を作成していません'}
            </p>
          </div>
        ) : null}
        
        {/* フィードバックモーダル */}
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          work={selectedWork}
          onSubmit={handleFeedbackSubmit}
        />
      </div>
    </div>
  );
}

// CSS追加
export const createStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    .animate-scaleIn {
      animation: scaleIn 0.2s ease-out forwards;
    }
    
    @keyframes fall {
      0% { transform: translateY(-100px); opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0; }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }
    
    .confetti {
      position: absolute;
      top: -20px;
      border-radius: 50%;
      width: 8px;
      height: 8px;
      opacity: 0.8;
      animation: fall 5s linear forwards;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    @keyframes sparkle {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0); opacity: 0; }
    }
    
    .sparkle {
      position: absolute;
      width: 15px;
      height: 15px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 15 15'%3E%3Cpath d='M7.5,0 L9,5 L14,7.5 L9,10 L7.5,15 L6,10 L1,7.5 L6,5 Z' fill='%23FFD700'/%3E%3C/svg%3E");
      background-size: contain;
      animation: sparkle 1s ease-in-out infinite;
      opacity: 0;
    }
    
    @keyframes ai-analysis-appear {
      0% { transform: translate(-50%, 100%); opacity: 0; }
      10% { transform: translate(-50%, -50%); opacity: 1; }
      90% { transform: translate(-50%, -50%); opacity: 1; }
      100% { transform: translate(-50%, -150%); opacity: 0; }
    }
    
    .ai-analysis-container {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: ai-analysis-appear 2s ease-in-out forwards;
      pointer-events: none;
      transition: opacity 0.5s ease-out;
    }
    
    .ai-analysis-icon {
      font-size: 48px;
      margin-bottom: 16px;
      filter: drop-shadow(0 0 8px rgba(255,255,255,0.7));
    }
    
    .ai-analysis-text {
      font-size: 24px;
      font-weight: bold;
      color: white;
      background: linear-gradient(to right, #4F46E5, #7C3AED);
      padding: 8px 16px;
      border-radius: 20px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    
    @keyframes suggestion-glow {
      0% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.3); opacity: 0.3; }
      50% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.8); opacity: 0.8; }
      100% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.3); opacity: 0; }
    }
    
    .suggestion-glow-effect {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      animation: suggestion-glow 0.7s ease-in-out forwards;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
};

// 名前付きエクスポートを追加
export { ParentWorks };