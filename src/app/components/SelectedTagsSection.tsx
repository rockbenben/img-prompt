import React, { FC, useMemo } from "react";
import { useTranslations } from "next-intl";
import { tagLabels } from "@/app/utils/tagLabels";
import { TagItem } from "./types";

interface SelectedTagsSectionProps {
  selectedTags: TagItem[];
  onTagClick: (tag: TagItem) => void;
}

// 已选托盘：全站唯一的已选标签视图（调色盒只管文本编辑）。
// 按主体分组；芯片刻意中性——分组信息由行结构承载，再按组上色是重复编码，
// 且组序号轮换色在删组后会让后续组集体变色。candy 色彩留给选词云。
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

  if (groups.length === 0) return null;

  return (
    <section className="pp-tray pp-selected" aria-label={t("currentSelection")}>
      <div className="pp-sel-head">
        <span className="pp-sec-title">{t("currentSelection")}</span>
        <span className="pp-sel-count">{selectedTags.length}</span>
      </div>
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
    </section>
  );
};

export default SelectedTagsSection;
