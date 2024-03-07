import React, { FC } from "react";

interface Tag {
  object: string;
  attribute: string;
  displayName: string;
  langName: string;
}

interface TagSectionProps {
  tags?: Tag[];
  selectedTags: Tag[];
  onTagClick: (tag: Tag) => void;
}

const TagSection: FC<TagSectionProps> = ({ tags = [], selectedTags, onTagClick }) => {
  return (
    <>
      {tags.map((tag) => (
        <div
          key={tag.displayName}
          className={`inline-block m-2 rounded cursor-pointer shadow transition-all duration-150 ease-in-out transform hover:scale-105 ${
            selectedTags.some((t) => t.displayName === tag.displayName) ? "opacity-50" : ""
          }`}
          onClick={() => onTagClick(tag)}>
          <span className={`bg-gray-700 text-white px-2 py-1 rounded-l `}>{tag.displayName}</span>
          <span className={`bg-gray-600 text-white px-2 py-1 rounded-r`}>{tag.langName}</span>
        </div>
      ))}
    </>
  );
};

export default TagSection;
