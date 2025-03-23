import React from 'react';
import { X } from 'lucide-react';
import { useAiDoctor } from '../../contexts/AiDoctorContext';

interface AiDoctorCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_AVATARS = [
  // 人物
  '👧', '👦', '👶', '🧒', '🎀', '⭐', '🌟',
  // かわいい動物
  '🐰', '🐱', '🐶', '🦊', '🐼', '🐨', '🦄',
  // 動物
  '🐯', '🦁', '🐮', '🐷', '🐸', '🐹', '🐻',
  // スポーツ
  '⚽', '⚾', '🏀', '🎾', '🏈', '🎳', '🏓',
  // その他
  '🌈', '💫', '✨', '🎨', '🎮', '🎪', '🎭'
];

const THEME_COLORS = [
  '#FFB5E8', // パステルピンク
  '#B5EAEA', // パステルブルー
  '#FFE5B5', // パステルオレンジ
  '#E5FFB5', // パステルグリーン
  '#B5B5FF', // パステルパープル
  '#FFB5D6', // ライトピンク
  '#B5FFE5', // ミントグリーン
  '#FFD6B5', // ピーチ
  '#DEB5FF', // ラベンダー
  '#B5FFB5', // ライトグリーン
  '#FFC5C5', // ソフトコーラル
  '#C5C5FF', // ベビーブルー
  '#FFEFB5', // バニラ
  '#E8B5FF', // ライトパープル
  '#B5FFF1', // アクア
  '#FFB5B5', // サーモンピンク
  '#D1FFB5', // ライムグリーン
  '#FFB5E0', // ローズピンク
  '#B5D4FF', // スカイブルー
  '#FFE0B5'  // アプリコット
];

const AiDoctorCustomizeModal: React.FC<AiDoctorCustomizeModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useAiDoctor();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 w-[32rem] shadow-lg border border-blue-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ものしり博士のカスタマイズ</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full text-blue-300 hover:text-blue-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              アバター
            </label>
            <div className="grid grid-cols-7 gap-3 p-2 bg-white/50 rounded-xl">
              {AVAILABLE_AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => updateSettings({ avatar })}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl text-2xl transition-all duration-200 ${
                    settings.avatar === avatar
                      ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-200 shadow-md transform scale-105'
                      : 'hover:bg-white/80 hover:scale-102'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              テーマカラー
            </label>
            <div className="grid grid-cols-10 gap-2 p-2 bg-white/50 rounded-xl">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => updateSettings({ themeColor: color })}
                  className={`w-8 h-8 rounded-xl transition-all duration-200 ${
                    settings.themeColor === color
                      ? 'border-2 border-blue-200 shadow-md transform scale-105'
                      : 'hover:opacity-80 hover:scale-102'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDoctorCustomizeModal; 