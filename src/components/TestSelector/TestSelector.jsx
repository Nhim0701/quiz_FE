import React from 'react';

export default function TestSelector({ topics, onSelectTopic }) {
  return (
    <div className="flex gap-4">
      {topics.map(topic => (
        <button
          key={topic}
          onClick={() => onSelectTopic(topic)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
