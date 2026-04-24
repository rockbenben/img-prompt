import React, { FC, useMemo } from "react";
import { Image as AntdImage, Tooltip, theme } from "antd";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";

interface TagSectionProps {
  tags?: TagItem[];
  selectedTags: TagItem[];
  onTagClick: (tag: TagItem) => void;
}

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

const buttonResetStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  font: "inherit",
  cursor: "pointer",
  display: "inline-block",
};

const TagSection: FC<TagSectionProps> = ({ tags = [], selectedTags, onTagClick }) => {
  const { token } = theme.useToken();

  const renderTags = useMemo(() => {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
        {tags.map((tag) => {
          const isSelected = selectedTags.some((t) => t.displayName === tag.displayName);
          const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";

          const mainBg = isSelected ? token.colorPrimary : token.colorFillTertiary;
          const mainColor = isSelected ? token.colorTextLightSolid : token.colorText;
          const subBg = isSelected ? token.colorPrimaryActive : token.colorFillSecondary;

          const tagElement = (
            <button
              type="button"
              key={`${tag.object}-${tag.attribute}-${tag.displayName}`}
              onClick={() => onTagClick(tag)}
              aria-pressed={isSelected}
              className={`m-1 rounded transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-md ${isSelected ? "opacity-50" : ""}`}
              style={buttonResetStyle}>
              <span
                style={{
                  ...ellipsisStyle,
                  backgroundColor: mainBg,
                  color: mainColor,
                  padding: "4px 8px",
                  borderRadius: tagLangName ? "4px 0 0 4px" : 4,
                }}>
                {tag.displayName}
              </span>
              {tagLangName && (
                <span
                  style={{
                    ...ellipsisStyle,
                    backgroundColor: subBg,
                    color: mainColor,
                    padding: "4px 8px",
                    borderRadius: "0 4px 4px 0",
                  }}>
                  {tagLangName}
                </span>
              )}
            </button>
          );

          const hasTooltip = tag.preview || tag.description || (tag.langName && tag.langName !== tag.displayName && tag.langName.length > 20);
          return hasTooltip ? (
            <Tooltip key={`${tag.object}-${tag.attribute}-${tag.displayName}`} title={renderTooltipContent(tag)} placement="top">
              {tagElement}
            </Tooltip>
          ) : (
            tagElement
          );
        })}
      </div>
    );
  }, [tags, selectedTags, onTagClick, token]);

  return renderTags;
};

export default TagSection;
