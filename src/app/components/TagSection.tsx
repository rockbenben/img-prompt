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

const colors = [
  { dark: "bg-gray-700", light: "bg-gray-600" },
  { dark: "bg-blue-900", light: "bg-blue-800" },
  { dark: "bg-green-900", light: "bg-green-800" },
  { dark: "bg-red-900", light: "bg-red-800" },
  { dark: "bg-purple-900", light: "bg-purple-800" },
  { dark: "bg-yellow-900", light: "bg-yellow-800" },
  { dark: "bg-indigo-800", light: "bg-indigo-700" },
  // Add more color pairs as needed
];

const TagSection: FC<TagSectionProps> = ({ tags = [], selectedTags, onTagClick }) => {
  const handleClick = useCallback(
    (tag: Tag) => {
      onTagClick(tag);
    },
    [onTagClick]
  );

  const renderTags = useMemo(() => {
    return tags.map((tag, index) => {
      const isSelected = selectedTags.some((t) => t.displayName === tag.displayName);
      const colorIndex = Math.floor(index / 10) % colors.length;
      const { dark, light } = colors[colorIndex];

      return (
        <div
          key={`${tag.object}-${tag.attribute}-${tag.displayName}`}
          className={`inline-block m-2 rounded cursor-pointer shadow transition-all duration-150 ease-in-out transform hover:scale-105 hover:shadow-lg ${isSelected ? "opacity-50" : ""}`}
          onClick={() => handleClick(tag)}
          style={{ transition: "background-color 0.3s" }}>
          <span className={`${dark} text-white px-2 py-1 rounded-l`}>{tag.displayName}</span>
          <span className={`${light} text-white px-2 py-1 rounded-r`}>{tag.langName}</span>
        </div>
      );
    });
  }, [tags, selectedTags, handleClick]);

  return <>{renderTags}</>;
};

export default TagSection;
