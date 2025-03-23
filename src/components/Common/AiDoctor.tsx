import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2, Mic, MicOff, Volume2, VolumeX, Settings, Minus } from 'lucide-react';
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
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('aiDoctorPosition');
    return saved ? JSON.parse(saved) : { x: 20, y: 20 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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

  // メッセージを永続化
  useEffect(() => {
    const savedMessages = localStorage.getItem('aiDoctorMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // メッセージを保存
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aiDoctorMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // スクロール処理
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // ドラッグ処理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // 位置を保存
  useEffect(() => {
    localStorage.setItem('aiDoctorPosition', JSON.stringify(position));
  }, [position]);

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

  // フリガナを除去する関数
  const removeRuby = (text: string): string => {
    return text.replace(/[（(].+?[)）]/g, '');
  };

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
        // フリガナを除去してから読み上げ
        utteranceRef.current.text = removeRuby(lastMessage.text);
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

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

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
            className="bg-white rounded-lg shadow-lg p-4 mb-4 w-[32rem]"
            onMouseDown={handleMouseDown}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">AIはかせ</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsCustomizeModalOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={handleMinimize}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="h-80 overflow-y-auto mb-4 px-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    msg.isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      msg.isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-3">
                  <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-800">
                    考え中...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center space-x-3 px-2">
              <button
                onClick={toggleListening}
                className={`p-3 rounded-xl ${
                  isListening ? 'bg-red-500' : 'bg-blue-500'
                } text-white transition-all duration-200 shadow-lg hover:scale-110 transform hover:rotate-3`}
                title={isListening ? '音声入力を停止' : '音声入力を開始'}
              >
                <div className="bg-white rounded-full p-3">
                  {isListening ? 
                    <MicOff className="h-8 w-8 text-red-500" /> : 
                    <Mic className="h-8 w-8 text-blue-500" />
                  }
                </div>
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder="ここにメッセージをかいてね！"
                className="flex-1 p-3 border-2 border-blue-200 rounded-xl text-base shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={isListening}
              />
              {messages.length > 0 && !messages[messages.length - 1].isUser && (
                <button
                  onClick={() => {
                    if (!isSpeaking) {
                      const lastMessage = messages[messages.length - 1];
                      if (!lastMessage.isUser) {
                        if (utteranceRef.current) {
                          utteranceRef.current.text = removeRuby(lastMessage.text);
                          window.speechSynthesis.speak(utteranceRef.current);
                          setIsSpeaking(true);
                          utteranceRef.current.onend = () => {
                            setIsSpeaking(false);
                          };
                        }
                      }
                    } else {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    }
                  }}
                  className={`p-3 rounded-xl ${
                    isSpeaking ? 'bg-gray-500' : 'bg-green-500'
                  } text-white transition-all duration-200 shadow-lg hover:scale-110 transform hover:-rotate-3`}
                  title={isSpeaking ? '読み上げを停止' : '回答を読み上げる'}
                >
                  <div className="bg-white rounded-full p-3">
                    {isSpeaking ? (
                      <VolumeX className="h-8 w-8 text-gray-500" />
                    ) : (
                      <Volume2 className="h-8 w-8 text-green-500" />
                    )}
                  </div>
                </button>
              )}
              <button
                onClick={handleSendMessage}
                className="p-3 rounded-xl bg-blue-500 text-white transition-all duration-200 shadow-lg hover:scale-110 transform hover:rotate-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0"
                disabled={!inputMessage.trim() || isLoading}
                title="メッセージを送信"
              >
                <div className="bg-white rounded-full p-3">
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </button>
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