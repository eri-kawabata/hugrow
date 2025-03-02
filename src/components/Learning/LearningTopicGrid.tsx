import React from 'react';
import { Link } from 'react-router-dom';
import { LearningTopic } from '../../types/learning';

type LearningTopicGridProps = {
  topics: LearningTopic[];
  basePath: string;
};

export function LearningTopicGrid({ topics, basePath }: LearningTopicGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <Link
          key={topic.id}
          to={`${basePath}/${topic.id}`}
          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          {topic.thumbnailUrl && (
            <div className="aspect-video relative">
              <img
                src={topic.thumbnailUrl}
                alt={topic.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
            {topic.description && (
              <p className="text-gray-600 text-sm">{topic.description}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
} 