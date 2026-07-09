import React, { FC, forwardRef } from "react";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";
import TagTooltipWrapper from "./TagTooltipWrapper";

// candy 六色按块轮换（每 8 个标签换一色相）；颜色值由 globals.css 的
// --pp-c-* 变量提供，明暗模式自动翻转，组件本身不感知主题。
const CANDY_COUNT = 6;
const BLOCK_SIZE = 8;

interface TagButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  tag: TagItem;
  colorIndex: number;
  isSelected: boolean;
  onClick: () => void;
}

const TagButton = forwardRef<HTMLButtonElement, TagButtonProps>(({ tag, colorIndex, isSelected, onClick, ...rest }, ref) => {
  const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`pp-tag pp-c-${colorIndex}${isSelected ? " pp-on" : ""}`}>
      {/* 母语浏览，英文输出：母语领先为主，英文（实际输出值）次级跟随 */}
      <span className="pp-tag-dot" aria-hidden="true" />
      {tagLangName && <span className="pp-tag-cn">{tagLangName}</span>}
      <span className="pp-tag-en">{tag.displayName}</span>
    </button>
  );
});
TagButton.displayName = "TagButton";

interface TagSectionMulticolorProps {
  tags?: TagItem[];
  selectedNameSet: Set<string>;
  onTagClick: (tag: TagItem) => void;
}

const TagSectionMulticolor: FC<TagSectionMulticolorProps> = ({ tags = [], selectedNameSet, onTagClick }) => {
  return (
    <div className="flex flex-wrap mt-2 mb-1">
      {tags.map((tag, index) => {
        const isSelected = selectedNameSet.has(tag.displayName);
        const colorIndex = Math.floor(index / BLOCK_SIZE) % CANDY_COUNT;
        const key = `${tag.object}-${tag.attribute}-${tag.displayName}`;
        const button = <TagButton key={key} tag={tag} colorIndex={colorIndex} isSelected={isSelected} onClick={() => onTagClick(tag)} />;
        const hasTooltip = tag.preview || tag.description || (tag.langName && tag.langName !== tag.displayName && tag.langName.length > 20);
        return hasTooltip ? (
          <TagTooltipWrapper key={key} tag={tag}>
            {button}
          </TagTooltipWrapper>
        ) : (
          button
        );
      })}
    </div>
  );
};

export default TagSectionMulticolor;
