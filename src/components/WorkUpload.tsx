import React from 'react';
import { Palette, Camera, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WorkUpload() {
  return (
    <div className="max-w-5xl mx-auto pb-28">
      {/* ヘッダーセクション - グラデーション背景を追加 */}
      <div className="bg-gradient-to-r from-[#8ec5d6] via-[#f7c5c2] to-[#f5f6bf] -mx-4 px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-b-[40px] shadow-lg mb-12">
        <h1 className="text-4xl font-bold text-white text-center drop-shadow-md">どんな作品をつくる？</h1>
      </div>
      
      {/* Upload Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto px-4">
        <Link
          to="/child/works/drawing"
          className="group bg-gradient-to-br from-white to-[#8ec5d6]/20 rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-4 border-[#8ec5d6] hover:scale-105"
        >
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-5 bg-[#8ec5d6]/30 rounded-2xl group-hover:bg-[#8ec5d6]/40 transition-colors">
                <Palette className="h-12 w-12 text-[#5d7799]" />
              </div>
              <span className="text-xl font-bold text-[#5d7799]">絵を描く</span>
            </div>
          </div>
        </Link>

        <Link
          to="/child/works/camera"
          className="group bg-gradient-to-br from-white to-[#f7c5c2]/20 rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-4 border-[#f7c5c2] hover:scale-105"
        >
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-5 bg-[#f7c5c2]/30 rounded-2xl group-hover:bg-[#f7c5c2]/40 transition-colors">
                <Camera className="h-12 w-12 text-[#5d7799]" />
              </div>
              <span className="text-xl font-bold text-[#5d7799]">写真・動画</span>
            </div>
          </div>
        </Link>

        <Link
          to="/child/works/audio"
          className="group bg-gradient-to-br from-white to-[#f5f6bf]/20 rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-4 border-[#f5f6bf] hover:scale-105"
        >
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-5 bg-[#f5f6bf]/30 rounded-2xl group-hover:bg-[#f5f6bf]/40 transition-colors">
                <Mic className="h-12 w-12 text-[#5d7799]" />
              </div>
              <span className="text-xl font-bold text-[#5d7799]">音声録音</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}