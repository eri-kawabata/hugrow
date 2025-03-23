import React from 'react';
import { X } from 'lucide-react';
import { useAiDoctor } from '../../contexts/AiDoctorContext';

interface AiDoctorCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_AVATARS = [
  '🤖', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🔬', '👩‍🔬', '🧑‍🔬',
  '👨‍🏫', '👩‍🏫', '🧑‍🏫', '🎓', '📚', '🔬', '💡'
];

const THEME_COLORS = [
  '#3B82F6', // 青
  '#10B981', // 緑
  '#F59E0B', // オレンジ
  '#EF4444', // 赤
  '#8B5CF6', // 紫
  '#EC4899', // ピンク
  '#14B8A6', // ターコイズ
  '#F97316', // オレンジ
  '#6366F1', // インディゴ
  '#D946EF', // ピンク
];

const AiDoctorCustomizeModal: React.FC<AiDoctorCustomizeModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useAiDoctor();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI博士のカスタマイズ</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI博士の名前
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アバター
            </label>
            <div className="grid grid-cols-7 gap-2">
              {AVAILABLE_AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => updateSettings({ avatar })}
                  className={`p-2 rounded-lg text-2xl ${
                    settings.avatar === avatar
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              テーマカラー
            </label>
            <div className="grid grid-cols-5 gap-2">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => updateSettings({ themeColor: color })}
                  className={`w-full h-8 rounded-lg ${
                    settings.themeColor === color
                      ? 'border-2 border-gray-900'
                      : 'hover:opacity-80'
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