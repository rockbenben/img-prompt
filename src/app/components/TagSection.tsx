import React, { FC, useCallback, useMemo } from "react";

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
  const handleClick = useCallback(
    (tag: Tag) => {
      onTagClick(tag);
    },
    [onTagClick]
  );

  const renderTags = useMemo(() => {
    return tags.map((tag) => {
      const isSelected = selectedTags.some((t) => t.displayName === tag.displayName);

      return (
        <div
          key={`${tag.object}-${tag.attribute}-${tag.displayName}`}
          className={`inline-block m-2 rounded cursor-pointer shadow transition-all duration-150 ease-in-out transform hover:scale-105 ${isSelected ? "opacity-50" : ""}`}
          onClick={() => handleClick(tag)}>
          <span className="bg-gray-700 text-white px-2 py-1 rounded-l">{tag.displayName}</span>
          <span className="bg-gray-600 text-white px-2 py-1 rounded-r">{tag.langName}</span>
        </div>
      );
    });
  }, [tags, selectedTags, handleClick]);

  return <>{renderTags}</>;
};

export default TagSection;
