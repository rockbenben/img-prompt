import React, { FC } from "react";
import { tagLabels } from "@/app/utils/tagLabels";
import { TagItem } from "./types";
import TagTooltipWrapper from "./TagTooltipWrapper";

// candy 六色按块轮换（每 8 个标签换一色相）；颜色值由 globals.css 的
// --pp-c-* 变量提供，明暗模式自动翻转，组件本身不感知主题。
// mono：去掉 candy 色、选中态为墨色填充（.pp-tag.pp-mono，圆点由 CSS 隐藏）。
const CANDY_COUNT = 6;
const BLOCK_SIZE = 8;

interface TagButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tag: TagItem;
  tone: string;
  selected: boolean;
  onTagClick: (tag: TagItem) => void;
}

// 单独成组件是为了把 selectedNameSet 的消费压到这一层：React Compiler 对
// props 值稳定的子组件直接跳过渲染，点选一个标签只重渲染被按中的那颗。
// 剩余 props 透传给 <button>：TagTooltipWrapper/rc-trigger 用 cloneElement 注入
// 鼠标处理器、ref 与 className（ant-tooltip-open）。className 必须与自算的样式类
// 合并而不是被其整体覆盖——rc-trigger 只能看到 TagButton 元素上「没有」className，
// 直接 {...rest} 会把 pp-tag 整套样式顶掉，悬停瞬间按钮掉成裸文本。
const TagButton: FC<TagButtonProps> = ({ tag, tone, selected, onTagClick, className: injected, ...rest }) => {
  const { gloss: tagLangName, en } = tagLabels(tag);
  const cls = `pp-tag ${tone}${selected ? " pp-on" : ""}${injected ? " " + injected : ""}`;
  return (
    <button
      type="button"
      onClick={() => onTagClick(tag)}
      aria-pressed={selected}
      className={cls}
      {...rest}>
      {/* 母语浏览，英文输出：母语领先为主，英文（实际输出值）次级跟随 */}
      <span className="pp-tag-dot" aria-hidden="true" />
      {tagLangName && <span className="pp-tag-cn">{tagLangName}</span>}
      {en && <span className="pp-tag-en">{en}</span>}
    </button>
  );
};

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
        const key = `${tag.object}-${tag.attribute}-${tag.displayName}`;
        const button = (
          <TagButton
            key={key}
            tag={tag}
            tone={mono ? "pp-mono" : `pp-c-${Math.floor(index / BLOCK_SIZE) % CANDY_COUNT}`}
            selected={selectedNameSet.has(tag.displayName)}
            onTagClick={onTagClick}
          />
        );
        const hasTooltip =
          !!tag.preview || !!tag.description || (tag.langName && tag.langName !== tag.displayName && tag.langName.length > 20);
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

export default TagSection;
