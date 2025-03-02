import React from 'react';
import { X } from 'lucide-react';
import type { Badge } from '../lib/types';

type BadgeDetailModalProps = {
  badge: Badge;
  onClose: () => void;
};

export function BadgeDetailModal({ badge, onClose }: BadgeDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">バッジの詳細</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center gap-6 mb-6">
          <img
            src={badge.icon_url}
            alt={badge.name}
            className="w-24 h-24"
          />
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{badge.name}</h4>
            <p className="text-gray-600">{badge.description}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          カテゴリー: {badge.category}
        </div>
      </div>
    </div>
  );
} 