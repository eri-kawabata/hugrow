import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { useAiDoctor } from '../../contexts/AiDoctorContext';
import AiDoctorCustomizeModal from './AiDoctorCustomizeModal';
import { generateAIResponse } from '../../lib/gemini';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Position {
  x: number;
  y: number;
}

const AiDoctor: React.FC = () => {
  const { settings, updateSettings } = useAiDoctor();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 音声認識の設定
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window.webkitSpeechRecognition as any)();
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // 音声合成の設定
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utteranceRef.current = utterance;
    }
  }, []);

  // メッセージの自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 音声認識の開始/停止
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // 音声合成の開始/停止
  const toggleSpeaking = () => {
    if (!utteranceRef.current) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isUser) {
        utteranceRef.current.text = lastMessage.text;
        window.speechSynthesis.speak(utteranceRef.current);
      }
    }
    setIsSpeaking(!isSpeaking);
  };

  // メッセージの送信
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(inputMessage);
      const aiMessage: Message = {
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        text: 'ごめんなさい、ちょっと分からないことがありました。もう一度教えてもらえますか？',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // クリックハンドリングの修正
  const handleClick = () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      // ダブルクリックの場合
      setIsOpen(true);
      setIsMinimized(false);
      setLastClickTime(0); // タイマーをリセット
    } else {
      // シングルクリックの場合
      setLastClickTime(currentTime);
    }
  };

  // ドラッグ&ドロップ機能の修正
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      // ダブルクリックの場合はドラッグを開始しない
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // 画面の端に制限
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // グローバルなマウスイベントの設定
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // 位置の保存
  useEffect(() => {
    const savedPosition = localStorage.getItem('aiDoctorPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aiDoctorPosition', JSON.stringify(position));
  }, [position]);

  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white rounded-lg shadow-lg p-4 mb-4 w-80"
            onMouseDown={handleMouseDown}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">{settings.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCustomizeModalOpen(true)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  title="カスタマイズ"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleSpeaking}
                  className={`p-1 rounded-full ${
                    isSpeaking ? 'text-blue-500' : 'text-gray-400'
                  }`}
                  title={isSpeaking ? '音声をオフにする' : '音声をオンにする'}
                >
                  {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      message.isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        message.isUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-black'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                      考え中...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg ${
                    isListening ? 'bg-red-500' : 'bg-blue-500'
                  } text-white`}
                  title={isListening ? '音声入力を停止' : '音声入力を開始'}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="質問を入力してね！"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  style={{ backgroundColor: settings.themeColor }}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  送信
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
        onMouseDown={handleMouseDown}
        style={{ backgroundColor: settings.themeColor }}
      >
        {isMinimized ? (
          <Maximize2 className="h-6 w-6" />
        ) : (
          <span role="img" aria-label="AI Doctor" className="text-2xl">
            {settings.avatar}
          </span>
        )}
      </motion.button>

      <AiDoctorCustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />
    </div>
  );
};

export default AiDoctor; 