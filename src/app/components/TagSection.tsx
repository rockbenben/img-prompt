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
  { dark: "bg-pink-900", light: "bg-pink-800" },
  { dark: "bg-cyan-900", light: "bg-cyan-800" },
  { dark: "bg-purple-900", light: "bg-purple-800" },
  { dark: "bg-yellow-900", light: "bg-yellow-800" },
  { dark: "bg-indigo-900", light: "bg-indigo-800" },
];

const TagSection: FC<TagSectionProps> = ({ tags = [], selectedTags, onTagClick }) => {
  const handleClick = useCallback(
    (tag: Tag) => {
      onTagClick(tag);
    },
    [onTagClick]
  );

  const renderTags = useMemo(() => {
    const tagRows: JSX.Element[] = [];

    for (let i = 0; i < tags.length; i += 10) {
      const group = tags.slice(i, i + 10);
      const colorIndex = Math.floor(i / 10) % colors.length;
      const { dark, light } = colors[colorIndex];

      const row = (
        <div key={`row-${i}`} className="flex flex-wrap">
          {group.map((tag) => {
            const isSelected = selectedTags.some((t) => t.displayName === tag.displayName);
            const truncatedDisplayName = tag.displayName.length > 20 ? tag.displayName.slice(0, 20) + "..." : tag.displayName;

            return (
              <div
                key={`${tag.object}-${tag.attribute}-${tag.displayName}`}
                className={`inline-block m-2 rounded cursor-pointer shadow transition-all duration-150 ease-in-out transform hover:scale-105 hover:shadow-lg ${isSelected ? "opacity-50" : ""}`}
                onClick={() => handleClick(tag)}
                style={{ transition: "background-color 0.3s" }}>
                <span className={`${dark} text-white px-2 py-1 rounded-l`}>{truncatedDisplayName}</span>
                <span className={`${light} text-white px-2 py-1 rounded-r`}>{tag.langName}</span>
              </div>
            );
          })}
        </div>
      );

      tagRows.push(row);
    }

    return tagRows;
  }, [tags, selectedTags, handleClick]);

  return <>{renderTags}</>;
};

export default TagSection;
