import React, { FC } from "react";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";
import TagTooltipWrapper from "./TagTooltipWrapper";

interface TagSectionProps {
  tags?: TagItem[];
  selectedNameSet: Set<string>;
  onTagClick: (tag: TagItem) => void;
}

// 单色模式：与多彩模式同一套芯片结构（pp-tag），仅去掉 candy 色，
// 选中态为墨色填充。样式见 globals.css 的 .pp-tag.pp-mono。
const TagSection: FC<TagSectionProps> = ({ tags = [], selectedNameSet, onTagClick }) => {
  return (
    <div className="flex flex-wrap mt-2 mb-1">
      {tags.map((tag) => {
        const isSelected = selectedNameSet.has(tag.displayName);
        const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";
        const key = `${tag.object}-${tag.attribute}-${tag.displayName}`;

        const tagElement = (
          <button key={key} type="button" onClick={() => onTagClick(tag)} aria-pressed={isSelected} className={`pp-tag pp-mono${isSelected ? " pp-on" : ""}`}>
            {tagLangName && <span className="pp-tag-cn">{tagLangName}</span>}
            <span className="pp-tag-en">{tag.displayName}</span>
          </button>
        );

        const hasTooltip = tag.preview || tag.description || (tag.langName && tag.langName !== tag.displayName && tag.langName.length > 20);
        return hasTooltip ? (
          <TagTooltipWrapper key={key} tag={tag}>
            {tagElement}
          </TagTooltipWrapper>
        ) : (
          tagElement
        );
      })}
    </div>
  );
};

export default TagSection;
