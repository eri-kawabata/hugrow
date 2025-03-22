import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

function ChildSelectionScreen() {
  const [children, setChildren] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchChildren();
    initCanvas();

    // クリーンアップ関数
    return () => {
      if (window.animationFrameId) {
        cancelAnimationFrame(window.animationFrameId);
      }
    };
  }, []);

  // パーティクルアニメーションの初期化
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズをウィンドウサイズに合わせる
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // パーティクルの設定
    const particlesArray: Particle[] = [];
    const numberOfParticles = 50;
    
    // パーティクルクラス
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        
        // パステルカラーのランダム生成
        const hue = Math.floor(Math.random() * 60) + 280; // 紫〜ピンク系
        const saturation = Math.floor(Math.random() * 30) + 70; // 彩度
        const lightness = Math.floor(Math.random() * 20) + 75; // 明度（明るめ）
        this.color = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 画面外に出たら反対側から再登場
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    // パーティクルの初期化
    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    // パーティクルの描画と更新
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // グラデーションの波を描画
      const time = Date.now() * 0.001;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsla(${(time * 10) % 360}, 70%, 85%, 0.3)`);
      gradient.addColorStop(0.5, `hsla(${((time * 10) + 120) % 360}, 70%, 85%, 0.3)`);
      gradient.addColorStop(1, `hsla(${((time * 10) + 240) % 360}, 70%, 85%, 0.3)`);
      
      ctx.fillStyle = gradient;
      
      // 波の描画
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = Math.sin(x * 0.01 + time) * 20 + canvas.height / 2;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();
      
      // パーティクルの描画
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      
      window.animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
  };

  const fetchChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .maybeSingle();

      if (!parentProfile) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('parent_id', parentProfile.id)
        .eq('role', 'child')
        .order('child_number');

      setChildren(data || []);
    } catch (error) {
      console.error('子供プロフィール取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (child: Profile) => {
    console.log('子供選択:', child.username, 'プロファイルID:', child.id);
    
    // 選択した子供のIDをローカルストレージに保存
    localStorage.setItem('selectedChildId', child.id);
    localStorage.setItem('selectedChildProfileId', child.id);
    
    // 子供の名前も保存
    if (child.username) {
      localStorage.setItem('childName', child.username);
    }
    
    // カスタムイベントを発火して他のコンポーネントに通知（詳細情報を含める）
    const event = new CustomEvent('selectedChildChanged', {
      detail: {
        childId: child.id,
        childName: child.username,
        childProfileId: child.id
      }
    });
    window.dispatchEvent(event);
    
    // 子供モードに遷移
    navigate('/child');
  };

  // パステルカラーの背景色
  const getRandomBgColor = (index: number) => {
    const colors = [
      'from-pink-200 to-pink-100',
      'from-purple-200 to-purple-100',
      'from-indigo-200 to-indigo-100',
      'from-blue-200 to-blue-100',
      'from-green-200 to-green-100',
      'from-yellow-200 to-yellow-100',
      'from-orange-200 to-orange-100',
      'from-red-200 to-red-100',
      'from-teal-200 to-teal-100',
      'from-cyan-200 to-cyan-100',
    ];
    return colors[index % colors.length];
  };

  // テキストカラー
  const getTextColor = (index: number) => {
    const colors = [
      'text-pink-500',
      'text-purple-500',
      'text-indigo-500',
      'text-blue-500',
      'text-green-500',
      'text-yellow-500',
      'text-orange-500',
      'text-red-500',
      'text-teal-500',
      'text-cyan-500',
    ];
    return colors[index % colors.length];
  };

  // アイコンのランダム生成
  const getRandomEmoji = (index: number) => {
    const emojis = ['🚀', '🌟', '🎨', '🎮', '🎯', '🎸', '🏆', '🧩', '🧠', '🦄', '🎈', '🎁', '🎠', '🎡', '🎢', '🎪', '🎭', '🎨', '🧸', '🪁'];
    return emojis[index % emojis.length];
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* SVGフィルター定義 */}
      <svg className="absolute -z-50 opacity-0 w-0 h-0">
        <defs>
          {/* キラキラ効果用フィルター */}
          <filter id="sparkle-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="glow" />
            <feBlend in="SourceGraphic" in2="glow" mode="normal" />
          </filter>
          
          {/* 光沢効果用フィルター */}
          <filter id="shine-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feSpecularLighting result="specOut" in="blur" specularExponent="20" lightingColor="#ffffff">
              <fePointLight x="100" y="100" z="200" />
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>
      </svg>
      
      {/* キャンバス背景 */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full -z-10"
      />
      
      {/* 背景のぼかし効果 */}
      <div className="absolute inset-0 backdrop-blur-sm -z-5"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 py-12 px-4">
        {/* ヘッダー部分 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 transform hover:scale-110 transition-transform duration-300">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
              だれがつかう？
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-md mx-auto bg-white bg-opacity-70 rounded-full py-2 px-4 shadow-sm">
            あなたのプロフィールを選んでね！
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center max-w-md mx-auto border-4 border-pink-100 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-pink-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">子供プロフィールがありません</h2>
            <p className="text-gray-600 mb-8">まずは子供のプロフィールを追加してみましょう！</p>
            <button
              onClick={() => navigate('/parent/profile')}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-blue-400 hover:to-cyan-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2 mx-auto group"
            >
              <span>子供を追加する</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {/* キラキラ効果 - 影効果なしで */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-pink-200 rounded-full animate-ping-slow"></div>
                <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-purple-200 rounded-full animate-ping-slow animation-delay-1"></div>
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-ping-slow animation-delay-2"></div>
                <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-cyan-200 rounded-full animate-ping-slow animation-delay-3"></div>
              </div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {children.map((child, index) => (
              <button
                key={child.id}
                onClick={() => handleSelectChild(child)}
                className="group relative bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden border-4 border-transparent hover:border-transparent animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* 背景装飾 */}
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${getRandomBgColor(index)} rounded-bl-full opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-200 to-yellow-100 rounded-tr-full opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                
                {/* キラキラエフェクト - 強化版 */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  {/* 上部のキラキラ - 増量 */}
                  <div className="absolute top-4 right-8 w-3 h-3 bg-pink-200 rounded-full animate-ping-slow animation-delay-0"></div>
                  <div className="absolute top-12 right-16 w-2 h-2 bg-purple-200 rounded-full animate-ping-slow animation-delay-1"></div>
                  <div className="absolute top-20 right-12 w-4 h-4 bg-blue-200 rounded-full animate-ping-slow animation-delay-2"></div>
                  <div className="absolute top-8 right-20 w-3 h-3 bg-cyan-200 rounded-full animate-ping-slow animation-delay-3"></div>
                  <div className="absolute top-16 right-24 w-2 h-2 bg-teal-200 rounded-full animate-ping-slow animation-delay-0"></div>
                  
                  {/* 下部のキラキラ - 増量 */}
                  <div className="absolute bottom-8 left-12 w-3 h-3 bg-yellow-200 rounded-full animate-ping-slow animation-delay-1"></div>
                  <div className="absolute bottom-16 left-20 w-2 h-2 bg-orange-200 rounded-full animate-ping-slow animation-delay-2"></div>
                  <div className="absolute bottom-12 left-8 w-4 h-4 bg-red-200 rounded-full animate-ping-slow animation-delay-0"></div>
                  <div className="absolute bottom-20 left-16 w-3 h-3 bg-green-200 rounded-full animate-ping-slow animation-delay-3"></div>
                  <div className="absolute bottom-4 left-24 w-2 h-2 bg-indigo-200 rounded-full animate-ping-slow animation-delay-1"></div>
                  
                  {/* 中央部のキラキラ - 新規追加 */}
                  <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-pink-300 rounded-full animate-ping-slow animation-delay-2"></div>
                  <div className="absolute top-1/3 right-1/2 w-3 h-3 bg-purple-300 rounded-full animate-ping-slow animation-delay-0"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-blue-300 rounded-full animate-ping-slow animation-delay-1"></div>
                  <div className="absolute bottom-1/2 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-ping-slow animation-delay-3"></div>
                  
                  {/* 星型のキラキラ - より多く */}
                  <div className="absolute top-1/4 right-1/4">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-yellow-300 animate-spin-slow animation-delay-1">
                      <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-1/4 left-1/4">
                    <svg width="20" height="20" viewBox="0 0 24 24" className="text-pink-300 animate-spin-slow animation-delay-2">
                      <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                    </svg>
                  </div>
                  <div className="absolute top-1/3 left-1/3">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="text-purple-300 animate-ping-slow animation-delay-0">
                      <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-1/3 right-1/3">
                    <svg width="18" height="18" viewBox="0 0 24 24" className="text-cyan-300 animate-spin-slow animation-delay-3">
                      <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative p-8 flex items-center">
                  {/* アバター部分 */}
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${getRandomBgColor(index)} flex items-center justify-center text-white text-5xl shadow-md group-hover:scale-110 transition-transform duration-500 border-4 border-white overflow-hidden group-hover:shadow-lg`}>
                    {child.avatar_url ? (
                      <img 
                        src={child.avatar_url} 
                        alt={child.username} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{child.username.charAt(0).toUpperCase()}</span>
                    )}
                    
                    {/* アバター周りのキラキラ - 影効果なしで */}
                    <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      {/* アバター周りの小さなキラキラ */}
                      <div className="absolute top-0 right-1/4 w-2 h-2 bg-pink-200 rounded-full animate-ping-slow"></div>
                      <div className="absolute top-1/4 right-0 w-2 h-2 bg-purple-200 rounded-full animate-ping-slow animation-delay-1"></div>
                      <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-ping-slow animation-delay-2"></div>
                      <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-cyan-200 rounded-full animate-ping-slow animation-delay-3"></div>
                    </div>
                  </div>
                  
                  {/* 名前とアイコン */}
                  <div className="ml-8 flex-1">
                    <h2 className="text-3xl font-bold mb-2 transition-colors duration-300 relative">
                      {child.username}
                      {/* 名前の下のキラキラライン - 影効果なしで */}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 opacity-70 group-hover:w-full transition-all duration-500 ease-in-out"></span>
                      {/* 名前の周りのキラキラ */}
                      <span className="absolute -top-1 left-1/4 w-1 h-1 bg-pink-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow"></span>
                      <span className="absolute -top-1 left-2/4 w-1 h-1 bg-purple-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow animation-delay-1"></span>
                      <span className="absolute -top-1 left-3/4 w-1 h-1 bg-blue-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow animation-delay-2"></span>
                    </h2>
                    <div className="flex items-center text-gray-500 group-hover:text-gray-700 transition-colors">
                      <span className="mr-2 text-2xl group-hover:animate-bounce">{getRandomEmoji(index)}</span>
                      <span className="text-lg">タップしてはじめる</span>
                    </div>
                  </div>
                  
                  {/* 矢印アイコン */}
                  <div className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-2 transition-all duration-300 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {/* 矢印の周りのキラキラ - 影効果なしで */}
                    <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-orange-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow animation-delay-2"></div>
                  </div>
                </div>
                
                {/* ホバー時のキラキラ効果 - 影効果なしで */}
                <div className="absolute -inset-1 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none">
                  {/* 外周のキラキラ */}
                  <div className="absolute top-0 left-1/4 w-2 h-2 bg-pink-200 rounded-full animate-ping-slow"></div>
                  <div className="absolute top-0 right-1/4 w-2 h-2 bg-purple-200 rounded-full animate-ping-slow animation-delay-1"></div>
                  <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-ping-slow animation-delay-2"></div>
                  <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-cyan-200 rounded-full animate-ping-slow animation-delay-3"></div>
                  <div className="absolute top-1/4 left-0 w-2 h-2 bg-yellow-200 rounded-full animate-ping-slow animation-delay-2"></div>
                  <div className="absolute top-1/4 right-0 w-2 h-2 bg-orange-200 rounded-full animate-ping-slow animation-delay-3"></div>
                  <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-red-200 rounded-full animate-ping-slow"></div>
                  <div className="absolute bottom-1/4 right-0 w-2 h-2 bg-green-200 rounded-full animate-ping-slow animation-delay-1"></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChildSelectionScreen; 