import React, { useState } from 'react';
import { Palette, Brush, Shapes, BookOpen, Award, Clock, CheckCircle, Star, ArrowRight, Lightbulb } from 'lucide-react';

// モックデータ
const MOCK_LEARNING_DATA = {
  currentUnit: {
    title: '色彩と表現',
    progress: 65,
    nextLesson: '光と影の表現',
    description: '色の組み合わせと感情表現について学びます。'
  },
  completedLessons: [
    { id: 1, title: '基本の線画', completedAt: '2023-03-01', masteryLevel: 90 },
    { id: 2, title: '形の描き方', completedAt: '2023-03-05', masteryLevel: 85 },
    { id: 3, title: '色の基本', completedAt: '2023-03-10', masteryLevel: 75 },
    { id: 4, title: '水彩画入門', completedAt: '2023-03-15', masteryLevel: 80 }
  ],
  upcomingLessons: [
    { id: 5, title: '光と影の表現', difficulty: '中級', estimatedTime: 30 },
    { id: 6, title: '人物画の基本', difficulty: '中級', estimatedTime: 45 },
    { id: 7, title: '風景画の構図', difficulty: '上級', estimatedTime: 40 }
  ],
  achievements: [
    { id: 1, title: '最初の作品', description: '初めての作品を完成させました', icon: 'Brush', date: '2023-02-28' },
    { id: 2, title: '色彩マスター', description: '色の基本を習得しました', icon: 'Palette', date: '2023-03-10' },
    { id: 3, title: '継続の達人', description: '7日連続で学習しました', icon: 'Calendar', date: '2023-03-12' }
  ],
  skills: [
    { name: 'デッサン力', level: 3, maxLevel: 5, description: '物の形を正確に捉える力' },
    { name: '色彩感覚', level: 2, maxLevel: 5, description: '色の組み合わせを理解する力' },
    { name: '構図', level: 2, maxLevel: 5, description: '画面の中での配置を考える力' },
    { name: '表現力', level: 3, maxLevel: 5, description: '感情や考えを表現する力' }
  ],
  learningPath: [
    { id: 1, title: '基礎', completed: true },
    { id: 2, title: '色彩', completed: true },
    { id: 3, title: '構図', completed: false, current: true },
    { id: 4, title: '表現技法', completed: false },
    { id: 5, title: '応用', completed: false }
  ],
  weeklyActivity: [
    { day: '月', minutes: 20 },
    { day: '火', minutes: 30 },
    { day: '水', minutes: 15 },
    { day: '木', minutes: 0 },
    { day: '金', minutes: 25 },
    { day: '土', minutes: 45 },
    { day: '日', minutes: 20 }
  ],
  totalLearningTime: 155, // 分
  totalCompletedLessons: 4,
  totalLessons: 12
};

export function ArtsAnalytics() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">アート学習の進捗</h1>
        <p className="text-gray-600 mt-1">お子様のアート学習の進捗状況と次のステップを確認できます</p>
      </div>

      {/* 現在の学習ユニット */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">現在の学習: {MOCK_LEARNING_DATA.currentUnit.title}</h2>
                <p className="text-gray-600 mt-1">{MOCK_LEARNING_DATA.currentUnit.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white border-4 border-indigo-100">
              <span className="text-xl font-bold text-indigo-600">{MOCK_LEARNING_DATA.currentUnit.progress}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="w-full bg-white rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-indigo-500" 
              style={{ width: `${MOCK_LEARNING_DATA.currentUnit.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">進行中</span>
          <div className="flex items-center">
            <span className="text-sm font-medium text-indigo-600 mr-2">次のレッスン: {MOCK_LEARNING_DATA.currentUnit.nextLesson}</span>
            <ArrowRight className="h-4 w-4 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* 学習の進捗と統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">総合進捗</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">完了レッスン</span>
              <span className="text-sm font-medium">{MOCK_LEARNING_DATA.totalCompletedLessons}/{MOCK_LEARNING_DATA.totalLessons}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div 
                className="h-2.5 rounded-full bg-green-500" 
                style={{ width: `${(MOCK_LEARNING_DATA.totalCompletedLessons / MOCK_LEARNING_DATA.totalLessons) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">総学習時間</span>
              <span className="text-sm font-medium">{Math.floor(MOCK_LEARNING_DATA.totalLearningTime / 60)}時間 {MOCK_LEARNING_DATA.totalLearningTime % 60}分</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">今週の学習</span>
                <span className="text-sm font-medium text-green-600">
                  {MOCK_LEARNING_DATA.weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)}分
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">週間学習活動</h3>
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          
          <div className="flex items-end justify-between h-32 mt-4">
            {MOCK_LEARNING_DATA.weeklyActivity.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-indigo-100 rounded-t-md" 
                  style={{ 
                    height: `${Math.max(day.minutes / 60 * 100, 5)}%`,
                    backgroundColor: day.minutes > 0 ? '#e0e7ff' : '#f3f4f6'
                  }}
                >
                  {day.minutes > 0 && (
                    <div 
                      className="w-full bg-indigo-500 rounded-t-md" 
                      style={{ height: `${day.minutes / 60 * 100}%` }}
                    ></div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600 mt-2">{day.day}</span>
                <span className="text-xs text-gray-500">{day.minutes}分</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">学習パス</h3>
            <ArrowRight className="h-5 w-5 text-indigo-600" />
          </div>
          
          <div className="relative mt-6">
            {MOCK_LEARNING_DATA.learningPath.map((step, index) => (
              <div key={index} className="flex items-center mb-6 relative">
                <div 
                  className={`rounded-full w-8 h-8 flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : step.current 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className={`font-medium ${
                    step.completed 
                      ? 'text-green-600' 
                      : step.current 
                        ? 'text-indigo-600' 
                        : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  {step.current && (
                    <p className="text-xs text-gray-500 mt-1">現在ここ</p>
                  )}
                </div>
                
                {/* 縦線 */}
                {index < MOCK_LEARNING_DATA.learningPath.length - 1 && (
                  <div 
                    className={`absolute left-4 top-8 w-0.5 h-6 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} 
                    style={{ transform: 'translateX(-50%)' }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* スキルレベル */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">スキルレベル</h3>
          <Star className="h-5 w-5 text-yellow-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_LEARNING_DATA.skills.map((skill, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800">{skill.name}</h4>
                <span className="text-sm text-gray-500">Lv.{skill.level}/{skill.maxLevel}</span>
              </div>
              <div className="flex mb-2">
                {[...Array(skill.maxLevel)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-6 h-6 rounded-full mr-1 flex items-center justify-center ${
                      i < skill.level ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Star className="h-3 w-3" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* 完了したレッスン */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">完了したレッスン</h3>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        
        <div className="space-y-4">
          {MOCK_LEARNING_DATA.completedLessons.map((lesson, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{lesson.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      完了日: {new Date(lesson.completedAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-sm font-medium text-gray-700">習熟度: {lesson.masteryLevel}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 次のレッスン */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">次のレッスン</h3>
          <ArrowRight className="h-5 w-5 text-indigo-600" />
        </div>
        
        <div className="space-y-4">
          {MOCK_LEARNING_DATA.upcomingLessons.map((lesson, index) => (
            <div key={index} className={`border-l-4 ${
              index === 0 ? 'border-indigo-500' : 'border-gray-200'
            } pl-4 py-2`}>
              <h4 className="font-medium text-gray-800">{lesson.title}</h4>
              <div className="flex items-center mt-1">
                <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-600 mr-2">
                  難易度: {lesson.difficulty}
                </span>
                <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-600">
                  予想時間: {lesson.estimatedTime}分
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 達成した成果 */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">達成した成果</h3>
          <Award className="h-5 w-5 text-amber-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_LEARNING_DATA.achievements.map((achievement, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start">
                <div className="rounded-full bg-amber-100 p-2 mr-3">
                  {achievement.icon === 'Brush' && <Brush className="h-4 w-4 text-amber-600" />}
                  {achievement.icon === 'Palette' && <Palette className="h-4 w-4 text-amber-600" />}
                  {achievement.icon === 'Calendar' && <Clock className="h-4 w-4 text-amber-600" />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    達成日: {new Date(achievement.date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 学習アドバイス */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-4">
          <div className="rounded-full bg-indigo-100 p-2 mr-3">
            <Lightbulb className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">学習アドバイス</h3>
        </div>
        
        <div className="pl-12">
          <p className="text-gray-700 mb-4">
            お子様は色彩の基本を理解し、デッサン力も向上しています。次のステップとして、構図の基本を学ぶことで、より魅力的な作品を作れるようになります。
          </p>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="font-medium text-indigo-700 mb-2">おすすめの活動</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                <span>身の回りの風景を観察して、簡単なスケッチを描いてみましょう</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                <span>色の組み合わせを試して、感情表現の練習をしてみましょう</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                <span>次回のレッスン「光と影の表現」の準備として、光の当たり方を観察してみましょう</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 