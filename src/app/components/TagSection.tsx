import React, { FC } from "react";
import { tagLabels } from "@/app/utils/tagLabels";
import { TagItem } from "./types";
import TagTooltipWrapper from "./TagTooltipWrapper";

// candy 六色按块轮换（每 8 个标签换一色相）；颜色值由 globals.css 的
// --pp-c-* 变量提供，明暗模式自动翻转，组件本身不感知主题。
// mono：去掉 candy 色、选中态为墨色填充（.pp-tag.pp-mono，圆点由 CSS 隐藏）。
const CANDY_COUNT = 6;
const BLOCK_SIZE = 8;

interface TagSectionProps {
  tags?: TagItem[];
  selectedNameSet: Set<string>;
  onTagClick: (tag: TagItem) => void;
  mono?: boolean;
}

const TagSection: FC<TagSectionProps> = ({ tags = [], selectedNameSet, onTagClick, mono = false }) => {
  return (
    <div className="flex flex-wrap mt-2 mb-1">
      {tags.map((tag, index) => {
        const isSelected = selectedNameSet.has(tag.displayName);
        const { gloss: tagLangName, en } = tagLabels(tag);
        const key = `${tag.object}-${tag.attribute}-${tag.displayName}`;
        const tone = mono ? "pp-mono" : `pp-c-${Math.floor(index / BLOCK_SIZE) % CANDY_COUNT}`;

        const tagElement = (
          <button key={key} type="button" onClick={() => onTagClick(tag)} aria-pressed={isSelected} className={`pp-tag ${tone}${isSelected ? " pp-on" : ""}`}>
            {/* 母语浏览，英文输出：母语领先为主，英文（实际输出值）次级跟随 */}
            <span className="pp-tag-dot" aria-hidden="true" />
            {tagLangName && <span className="pp-tag-cn">{tagLangName}</span>}
            {en && <span className="pp-tag-en">{en}</span>}
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
