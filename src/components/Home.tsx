import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Image, Heart } from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';

export function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-28">
      <GradientHeader 
        title="ほーむ" 
        gradientColors={{
          from: '#8ec5d6',
          via: '#f7c5c2',
          to: '#f5f6bf'
        }}
      />

      {/* メインアクションカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        <Link
          to="/child/learning"
          className="group bg-gradient-to-br from-white to-[#8ec5d6]/20 rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-4 border-[#8ec5d6] hover:scale-105"
        >
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="p-5 bg-[#8ec5d6]/30 rounded-2xl group-hover:bg-[#8ec5d6]/40 transition-colors transform group-hover:-translate-y-1 duration-300">
                <BookOpen className="h-12 w-12 text-[#5d7799]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5d7799] mb-2">がくしゅうをはじめる</h2>
                <p className="text-lg text-[#5d7799]/80">あたらしいレッスンに<br />ちょうせん</p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/child/works/new"
          className="group bg-gradient-to-br from-white to-[#f7c5c2]/20 rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-4 border-[#f7c5c2] hover:scale-105"
        >
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="p-5 bg-[#f7c5c2]/30 rounded-2xl group-hover:bg-[#f7c5c2]/40 transition-colors transform group-hover:-translate-y-1 duration-300">
                <Image className="h-12 w-12 text-[#5d7799]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5d7799] mb-2">さくひんをつくる</h2>
                <p className="text-lg text-[#5d7799]/80">あたらしいさくひんを<br />つくろう</p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/child/sel-quest"
          className="group bg-gradient-to-br from-white to-[#f5f6bf]/20 rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-4 border-[#f5f6bf] hover:scale-105"
        >
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="p-5 bg-[#f5f6bf]/30 rounded-2xl group-hover:bg-[#f5f6bf]/40 transition-colors transform group-hover:-translate-y-1 duration-300">
                <Heart className="h-12 w-12 text-[#5d7799]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5d7799] mb-2">きもちクエスト</h2>
                <p className="text-lg text-[#5d7799]/80">きょうのきもちを<br />きろく</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}