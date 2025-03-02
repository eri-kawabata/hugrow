import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <div>
      {/* 子供モードのナビゲーションで */}
      <Link to="/my-works">
        {/* ... 作品一覧ボタンの内容 */}
      </Link>
    </div>
  );
};

export default Navigation; 