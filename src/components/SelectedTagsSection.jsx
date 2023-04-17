import React from "react";
import "antd/dist/reset.css";

const SelectedTagsSection = ({ selectedTags, onTagClick }) => {
  // 按属性对标签进行分组
  const tagsByAttribute = selectedTags.reduce((acc, tag) => {
    if (!acc[tag.attribute]) {
      acc[tag.attribute] = [];
    }
    acc[tag.attribute].push(tag);
    return acc;
  }, {});

  return (
    <div className="selected-tags-section">
      {Object.entries(tagsByAttribute).map(([attribute, tags]) => (
        <React.Fragment key={attribute}>
          <span className="text-gray-500 ml-2">{attribute}</span>
          {tags.map((tag, index) => (
            <React.Fragment key={tag.displayName}>
              <div
                className="inline-block m-2 rounded"
                onClick={() => onTagClick(tag)}
              >
                <span className="bg-green-800 text-white px-2 py-1 rounded-l">
                  {tag.displayName}
                </span>
                <span className="bg-green-600 text-white px-2 py-1 rounded-r">
                  {tag.langName}
                </span>
              </div>
              {index === tags.length - 1 && <br />}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SelectedTagsSection;
