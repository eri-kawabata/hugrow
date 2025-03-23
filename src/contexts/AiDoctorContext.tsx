import React, { createContext, useContext, useState, useEffect } from 'react';

interface AiDoctorSettings {
  themeColor: string;
  avatar: string;
  name: string;
}

interface AiDoctorContextType {
  settings: AiDoctorSettings;
  updateSettings: (newSettings: Partial<AiDoctorSettings>) => void;
}

const defaultSettings: AiDoctorSettings = {
  themeColor: '#3B82F6', // デフォルトの青色
  avatar: '🤖',
  name: 'AI博士'
};

const AiDoctorContext = createContext<AiDoctorContextType | null>(null);

export const AiDoctorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AiDoctorSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('aiDoctorSettings');
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aiDoctorSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AiDoctorSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AiDoctorContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AiDoctorContext.Provider>
  );
};

export const useAiDoctor = (): AiDoctorContextType => {
  const context = useContext(AiDoctorContext);
  if (!context) {
    throw new Error('useAiDoctor must be used within an AiDoctorProvider');
  }
  return context;
}; 