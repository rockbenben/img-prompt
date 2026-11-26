import React, { FC, useState } from "react";
import { Image as AntdImage } from "antd";
import { CheckOutlined, ExpandOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { tagLabels } from "@/app/utils/tagLabels";
import { TagItem } from "./types";
import TagTooltipWrapper from "./TagTooltipWrapper";

interface TagButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tag: TagItem;
  selected: boolean;
  showPath?: boolean;
  onTagClick: (tag: TagItem) => void;
}

// 单独成组件是为了把 selectedNameSet 的消费压到这一层：React Compiler 对
// props 值稳定的子组件直接跳过渲染，点选一个标签只重渲染被按中的那颗。
// 剩余 props 透传给 <button>：TagTooltipWrapper/rc-trigger 用 cloneElement 注入
// 鼠标处理器、ref 与 className（ant-tooltip-open）。
const TagButton: FC<TagButtonProps> = ({ tag, selected, showPath, onTagClick, className: injected, ...rest }) => {
  const { gloss: tagLangName, en } = tagLabels(tag);
  const cls = `pp-tag${selected ? " pp-on" : ""}${injected ? " " + injected : ""}`;
  return (
    <button type="button" onClick={() => onTagClick(tag)} aria-pressed={selected} className={cls} {...rest}>
      {selected && <CheckOutlined className="pp-tag-check" aria-hidden="true" />}
      {tagLangName && <span className="pp-tag-cn">{tagLangName}</span>}
      {en && <span className="pp-tag-en">{en}</span>}
      {showPath && (tag.object || tag.attribute) && (
        <span className="pp-tag-path">
          {tag.object}
          {tag.attribute ? ` · ${tag.attribute}` : ""}
        </span>
      )}
    </button>
  );
};

interface TagVisualCardProps {
  tag: TagItem;
  selected: boolean;
  showPath?: boolean;
  previewLabel: string;
  onTagClick: (tag: TagItem) => void;
  onPreview: (tag: TagItem) => void;
}

const TagVisualCard: FC<TagVisualCardProps> = ({ tag, selected, showPath, previewLabel, onTagClick, onPreview }) => {
  const { gloss, en } = tagLabels(tag);
  const titleText = tag.description || (gloss ? `${gloss} · ${tag.displayName}` : tag.displayName);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(tag.preview) && failedSrc !== tag.preview;

  return (
    <div className={`pp-vcard${selected ? " pp-on" : ""}`}>
      <button type="button" className="pp-vcard-btn" aria-pressed={selected} onClick={() => onTagClick(tag)} title={titleText}>
        <div className="pp-vcard-media">
          {showImage ? (
            // 5040 条外链缩略图按需懒加载，已配置 unoptimized: true
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tag.preview}
              alt={gloss || tag.displayName}
              loading="lazy"
              decoding="async"
              className="pp-vcard-img"
              onError={() => setFailedSrc(tag.preview ?? null)}
            />
          ) : (
            <span className="pp-vcard-fallback" aria-hidden="true">
              {(gloss || tag.displayName).slice(0, 2)}
            </span>
          )}
          {selected && (
            <span className="pp-vcard-check" aria-hidden="true">
              <CheckOutlined />
            </span>
          )}
        </div>
        <div className="pp-vcard-body">
          {gloss && <span className="pp-vcard-cn">{gloss}</span>}
          {en && <span className="pp-vcard-en">{en}</span>}
          {showPath && (tag.object || tag.attribute) && (
            <span className="pp-vcard-path">
              {tag.object}
              {tag.attribute ? ` / ${tag.attribute}` : ""}
            </span>
          )}
        </div>
      </button>
      {showImage && (
        <button
          type="button"
          className="pp-vcard-zoom"
          aria-label={`${previewLabel}: ${gloss || tag.displayName}`}
          onClick={() => onPreview(tag)}>
          <ExpandOutlined aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

interface TagSectionProps {
  tags?: TagItem[];
  selectedNameSet: Set<string>;
  onTagClick: (tag: TagItem) => void;
  viewMode?: "compact" | "visual";
  showPath?: boolean;
}

const TagSection: FC<TagSectionProps> = ({ tags = [], selectedNameSet, onTagClick, viewMode = "compact", showPath = false }) => {
  const t = useTranslations("ToolPage");
  const [previewTag, setPreviewTag] = useState<TagItem | null>(null);

  if (viewMode === "visual") {
    return (
      <>
        <div className="pp-tag-grid">
          {tags.map((tag) => {
            const key = `${tag.object}-${tag.attribute}-${tag.displayName}`;
            return (
              <TagVisualCard
                key={key}
                tag={tag}
                selected={selectedNameSet.has(tag.displayName)}
                showPath={showPath}
                previewLabel={t("previewImage")}
                onTagClick={onTagClick}
                onPreview={setPreviewTag}
              />
            );
          })}
        </div>
        {previewTag?.preview && (
          <AntdImage
            src={previewTag.preview}
            alt={tagLabels(previewTag).gloss || previewTag.displayName}
            style={{ display: "none" }}
            preview={{
              open: true,
              src: previewTag.preview,
              onOpenChange: (open) => {
                if (!open) setPreviewTag(null);
              },
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="pp-tag-cloud">
      {tags.map((tag) => {
        const key = `${tag.object}-${tag.attribute}-${tag.displayName}`;
        const button = (
          <TagButton
            key={key}
            tag={tag}
            selected={selectedNameSet.has(tag.displayName)}
            showPath={showPath}
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
