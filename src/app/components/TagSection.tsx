import React, { FC, useMemo } from "react";
import { Tooltip } from "antd";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";

interface TagSectionProps {
  tags?: TagItem[];
  selectedTags: TagItem[];
  onTagClick: (tag: TagItem) => void;
}

// Tailwind 旧版颜色对：每10个标签使用一组颜色
/* const darkerColors = [
  { dark: "bg-gray-700", light: "bg-gray-600" },
  { dark: "bg-blue-900", light: "bg-blue-800" },
  { dark: "bg-green-900", light: "bg-green-800" },
  { dark: "bg-pink-900", light: "bg-pink-800" },
  { dark: "bg-cyan-900", light: "bg-cyan-800" },
  { dark: "bg-purple-900", light: "bg-purple-800" },
  { dark: "bg-yellow-900", light: "bg-yellow-800" },
  { dark: "bg-indigo-900", light: "bg-indigo-800" },
]; */

// Tailwind 颜色对：使用更柔和的色调，降低视觉负担
const colors = [
  { dark: "bg-slate-600", light: "bg-slate-500" },
  { dark: "bg-blue-600/80", light: "bg-blue-500/80" },
  { dark: "bg-emerald-600/80", light: "bg-emerald-500/80" },
  { dark: "bg-rose-600/80", light: "bg-rose-500/80" },
  { dark: "bg-cyan-600/80", light: "bg-cyan-500/80" },
  { dark: "bg-violet-600/80", light: "bg-violet-500/80" },
  { dark: "bg-amber-600/80", light: "bg-amber-500/80" },
  { dark: "bg-indigo-600/80", light: "bg-indigo-500/80" },
];

const TagSection: FC<TagSectionProps> = ({ tags = [], selectedTags, onTagClick }) => {
  const renderTags = useMemo(() => {
    const tagRows: React.ReactNode[] = [];

    for (let i = 0; i < tags.length; i += 10) {
      const group = tags.slice(i, i + 10);
      const colorIndex = Math.floor(i / 10) % colors.length;
      const { dark, light } = colors[colorIndex];

      tagRows.push(
        <div key={`row-${i}`} className="flex flex-wrap gap-1.5 mt-2 mb-1">
          {group.map((tag) => {
            const isSelected = selectedTags.some((t) => t.displayName === tag.displayName);
            const tagDisplayName = tag.displayName.length > 20 ? `${tag.displayName.slice(0, 20)}...` : tag.displayName;
            const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";

            const tagElement = (
              <div
                key={`${tag.object}-${tag.attribute}-${tag.displayName}`}
                onClick={() => onTagClick(tag)}
                className={`inline-block m-1 rounded cursor-pointer transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-md ${isSelected ? "opacity-50" : ""}`}>
                <span className={`${dark} text-white px-2 py-1 ${tagLangName ? "rounded-l" : "rounded"}`}>{tagDisplayName}</span>
                {tagLangName && <span className={`${light} text-white px-2 py-1 rounded-r`}>{tagLangName}</span>}
              </div>
            );

            // 如果有description，就用Tooltip包装
            return tag.description ? (
              <Tooltip key={`${tag.object}-${tag.attribute}-${tag.displayName}`} title={tag.description} placement="top">
                {tagElement}
              </Tooltip>
            ) : (
              tagElement
            );
          })}
        </div>
      );
    }

    return tagRows;
  }, [tags, selectedTags, onTagClick]);

  return <>{renderTags}</>;
};

export default TagSection;
