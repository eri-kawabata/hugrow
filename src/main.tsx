import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as Sentry from '@sentry/react';

// Sentryの初期化
Sentry.init({
  dsn: "", // Sentryのプロジェクト設定から取得したDSNを設定してください
  integrations: [],
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);