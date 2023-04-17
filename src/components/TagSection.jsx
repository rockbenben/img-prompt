// src/components/TagSection.jsx
import React from 'react';
import 'antd/dist/reset.css';

const TagSection = ({ tags = [], selectedTags, onTagClick }) => {
  return (
    <div className="tag-section">
      {tags.map((tag) => (
        <div
          key={tag.displayName}
          className={`inline-block m-2 rounded ${
            selectedTags.some((t) => t.displayName === tag.displayName) ? 'opacity-50' : ''
          }`}
          onClick={() => onTagClick(tag)}
        >
          <span className="bg-gray-800 text-white px-2 py-1 rounded-l">{tag.displayName}</span>
          <span className="bg-gray-600 text-white px-2 py-1 rounded-r">{tag.langName}</span>
        </div>
      ))}
    </div>
  );
};

export default TagSection;
