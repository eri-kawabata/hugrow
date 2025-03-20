import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Award, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { GradientHeader } from '@/components/Common/GradientHeader';

const lessons = [
  {
    id: 'biology',
    path: '/child/learning/science/biology',
    title: 'どうぶつとなかよし',
    description: 'かわいいどうぶつたちのくらしをのぞいてみよう！',
    difficulty: 1,
    duration: '20ぷん',
    points: 100
  },
  {
    id: 'plant',
    path: '/child/learning/science/plant',
    title: 'おはながすくすく',
    description: 'たねをうえて、おはながさくまでをみてみよう！',
    difficulty: 1,
    duration: '25ぷん',
    points: 120
  },
  {
    id: 'weather',
    path: '/child/learning/science/weather',
    title: 'おてんきマジック',
    description: 'あめやゆきがふるひみつをたんけんしよう！',
    difficulty: 2,
    duration: '30ぷん',
    points: 150
  },
  {
    id: 'earth',
    path: '/child/learning/science/earth',
    title: 'ちきゅうとうちゅう',
    description: 'おおきなちきゅうとキラキラほしをみてみよう！',
    difficulty: 2,
    duration: '35ぷん',
    points: 180
  },
  {
    id: 'matter',
    path: '/child/learning/science/matter',
    title: 'ふしぎなじっけん',
    description: 'たのしいまほうのようなじっけんをしてみよう！',
    difficulty: 3,
    duration: '40ぷん',
    points: 200
  }
];

export function Science() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/child/learning"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        もどる
      </Link>

      <GradientHeader 
        title="りかのせかい" 
        gradientColors={{
          from: '#8ec5d6',
          via: '#f7c5c2',
          to: '#f5f6bf'
        }}
      />

      <p className="text-xl text-center mb-12 text-gray-600">
        わくわくたのしい！ふしぎいっぱい！
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <motion.div
            key={lesson.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <Link to={lesson.path} className="block p-6">
              <h3 className="text-2xl font-bold mb-3 text-gray-800">
                {lesson.title}
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                {lesson.description}
              </p>
              <div className="flex items-center justify-between text-gray-500">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>
                    {'★'.repeat(lesson.difficulty)}
                    {'☆'.repeat(3 - lesson.difficulty)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{lesson.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-indigo-400" />
                  <span>{lesson.points}ポイント</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 