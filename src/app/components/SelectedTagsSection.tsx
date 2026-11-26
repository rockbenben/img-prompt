import React, { FC, useMemo } from "react";
import { useTranslations } from "next-intl";
import { tagLabels } from "@/app/utils/tagLabels";
import { TagItem } from "./types";

interface SelectedTagsSectionProps {
  selectedTags: TagItem[];
  onTagClick: (tag: TagItem) => void;
}

// 已选标签列表：内嵌于右侧工作台，按主体分组，点击即可移除。
const SelectedTagsSection: FC<SelectedTagsSectionProps> = ({ selectedTags = [], onTagClick }) => {
  const t = useTranslations("ToolPage");

  const groups = useMemo(() => {
    const byObject = new Map<string, TagItem[]>();
    for (const tag of selectedTags) {
      if (!tag.displayName) continue;
      const key = tag.object || t("fallback-other");
      const arr = byObject.get(key);
      if (arr) arr.push(tag);
      else byObject.set(key, [tag]);
    }
    return [...byObject.entries()];
  }, [selectedTags, t]);

  return (
    <section className="pp-sel-embed" aria-label={t("currentSelection")}>
      <div className="pp-sel-head">
        <span className="pp-sel-title">{t("currentSelection")}</span>
        <span className="pp-sel-count">{selectedTags.length}</span>
      </div>
      {groups.length === 0 ? (
        <p className="pp-sel-empty">{t("selectedEmpty")}</p>
      ) : (
        <div className="pp-sel-list">
          {groups.map(([object, tags]) => (
            <div key={object} className="pp-sel-group">
              <span className="pp-sel-obj">{object}</span>
              <div className="pp-sel-tokens">
                {tags.map((tag) => {
                  const { gloss, en } = tagLabels(tag);
                  return (
                    <button
                      key={tag.displayName}
                      type="button"
                      className="pp-token"
                      title={gloss ? `${gloss} · ${tag.displayName}` : tag.displayName}
                      onClick={() => onTagClick(tag)}>
                      {gloss && <span className="pp-token-cn">{gloss}</span>}
                      {en && <span className="pp-token-en">{en}</span>}
                      <span className="pp-token-x" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SelectedTagsSection;
