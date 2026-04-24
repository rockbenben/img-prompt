import React, { FC, forwardRef, useMemo } from "react";
import { Image as AntdImage, Tooltip } from "antd";
import { presetPalettes, presetDarkPalettes } from "@ant-design/colors";
import { useTheme } from "next-themes";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";

interface TagSectionMulticolorProps {
  tags?: TagItem[];
  selectedTags: TagItem[];
  onTagClick: (tag: TagItem) => void;
}

// antd 10 色循环（每 10 个标签换一组）—— 跳掉 red(警告感)/yellow(与gold近)/grey(中性)
const palette = ["blue", "cyan", "green", "lime", "gold", "orange", "volcano", "magenta", "purple", "geekblue"] as const;
type ColorName = (typeof palette)[number];

// 渲染 Tooltip 内容：langName（被截断时的全文）→ 图片（antd Image 自带点击放大）→ description
const renderTooltipContent = (tag: TagItem) => {
  const showLangName = tag.langName && tag.langName !== tag.displayName;
  return (
    <div className="text-center">
      {showLangName && <p className="text-sm font-medium mb-1">{tag.langName}</p>}
      {tag.preview && <AntdImage src={tag.preview} alt={tag.displayName} width={200} className="rounded mb-2" preview={{ mask: "🔍" }} />}
      {tag.description && <p className="text-sm">{tag.description}</p>}
    </div>
  );
};

const ellipsisStyle: React.CSSProperties = {
  display: "inline-block",
  maxWidth: 160,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  verticalAlign: "bottom",
};

interface TagButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  tag: TagItem;
  colorName: ColorName;
  isSelected: boolean;
  onClick: () => void;
}

const TagButton = forwardRef<HTMLButtonElement, TagButtonProps>(({ tag, colorName, isSelected, onClick, ...rest }, ref) => {
  const { resolvedTheme } = useTheme();

  // SSR 时 resolvedTheme 为 undefined，fallback 到 light（与 defaultTheme 一致）
  const isDark = resolvedTheme === "dark";
  const palettes = isDark ? presetDarkPalettes : presetPalettes;

  // antd 色阶 1-10 语义对应数组 0-indexed
  const c = (shade: number) => palettes[colorName][shade - 1];

  const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";

  // 配色策略：
  //  dark   — outlined unselected (c(2-3)+c(7) text+c(5) border) / filled bold selected (c(6-7)+#fff+c(8) border)
  //  light  — outlined unselected (c(1-2)+c(7) text+c(5) border) / filled bold selected (c(7)+#fff+c(8) border)
  // hover/focus 视觉效果由全局 .tag-multicolor-btn CSS 提供（translateY + shadow + brightness 0.94）
  let mainBg: string;
  let subBg: string;
  let textColor: string;
  let borderColor: string;
  let dividerColor: string;

  if (isDark) {
    if (isSelected) {
      mainBg = c(6);
      subBg = c(5);
      textColor = "#fff";
      borderColor = c(8);
      dividerColor = c(4);
    } else {
      mainBg = c(3);
      subBg = c(3);
      textColor = c(7);
      borderColor = c(5);
      dividerColor = c(4);
    }
  } else {
    if (isSelected) {
      mainBg = c(7);
      subBg = c(6);
      textColor = "#fff";
      borderColor = c(8);
      dividerColor = c(5);
    } else {
      mainBg = c(1);
      subBg = c(1);
      textColor = c(7);
      borderColor = c(5);
      dividerColor = c(3);
    }
  }

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    border: `1px solid ${borderColor}`,
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    borderRadius: 6,
    overflow: "hidden",
    margin: 4,
    fontSize: 13,
    fontWeight: isSelected ? 600 : 500,
  };

  const mainSpanStyle: React.CSSProperties = {
    ...ellipsisStyle,
    backgroundColor: mainBg,
    color: textColor,
    padding: isSelected ? "4px 10px" : "5px 10px",
    borderRight: tagLangName ? `1px solid ${dividerColor}` : "none",
  };

  const subSpanStyle: React.CSSProperties = {
    ...ellipsisStyle,
    backgroundColor: subBg,
    color: textColor,
    padding: isSelected ? "4px 10px" : "5px 10px",
  };

  return (
    <button {...rest} ref={ref} type="button" onClick={onClick} aria-pressed={isSelected} className="tag-multicolor-btn" style={buttonStyle}>
      <span style={mainSpanStyle}>{tag.displayName}</span>
      {tagLangName && <span style={subSpanStyle}>{tagLangName}</span>}
    </button>
  );
});
TagButton.displayName = "TagButton";

const TagSectionMulticolor: FC<TagSectionMulticolorProps> = ({ tags = [], selectedTags, onTagClick }) => {
  const renderTags = useMemo(() => {
    return (
      <div className="flex flex-wrap mt-2 mb-1">
        {tags.map((tag, index) => {
          const isSelected = selectedTags.some((t) => t.displayName === tag.displayName);
          const colorName = palette[Math.floor(index / 10) % palette.length];
          const key = `${tag.object}-${tag.attribute}-${tag.displayName}`;

          const button = <TagButton key={key} tag={tag} colorName={colorName} isSelected={isSelected} onClick={() => onTagClick(tag)} />;

          const hasTooltip = tag.preview || tag.description || (tag.langName && tag.langName !== tag.displayName && tag.langName.length > 20);
          return hasTooltip ? (
            <Tooltip key={key} title={renderTooltipContent(tag)} placement="top">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </div>
    );
  }, [tags, selectedTags, onTagClick]);

  return renderTags;
};

export default TagSectionMulticolor;
