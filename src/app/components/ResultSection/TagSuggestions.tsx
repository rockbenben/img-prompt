import React, { FC } from "react";
import { Flex, Tag, Tooltip } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { tagLabels } from "@/app/utils/tagLabels";
import { TagItem } from "../types";
import { useTouchOnly } from "../TagTooltipWrapper";

interface TagSuggestionsProps {
  suggestedTags: TagItem[];
  exactMatchTag: TagItem | null;
  onTagClick: (tag: TagItem) => void;
}

export const TagSuggestions: FC<TagSuggestionsProps> = ({ suggestedTags, exactMatchTag, onTagClick }) => {
  // 触屏上点按即选中，hover Tooltip 会在 tap 后弹出遮挡视图；而芯片文本本身
  // 已含母语+英文名（与 tip 内容重复），纯触屏直接不包 Tooltip。
  const touchOnly = useTouchOnly();
  if (!exactMatchTag && suggestedTags.length === 0) return null;

  const chipBody = (tag: TagItem) => {
    const { gloss, en } = tagLabels(tag);
    return (
      <>
        {gloss && <span className="pp-sug-cn">{gloss}</span>}
        {en && <span className="pp-sug-en">{en}</span>}
      </>
    );
  };
  const tip = (tag: TagItem) => (tag.langName && tag.langName !== tag.displayName ? `${tag.langName} - ${tag.displayName}` : tag.displayName);
  // key 挂在外层：Tooltip 分支返回的是 Tooltip，触屏分支返回的是 Tag 本身
  const wrap = (tag: TagItem, chip: React.ReactElement, key: React.Key) =>
    touchOnly ? React.cloneElement(chip, { key }) : <Tooltip key={key} title={tip(tag)}>{chip}</Tooltip>;

  return (
    <Flex gap="6px 6px" wrap style={{ marginTop: 10 }}>
      {exactMatchTag &&
        wrap(
          exactMatchTag,
          <Tag icon={<CheckCircleOutlined />} className="pp-sug pp-sug-exact cursor-pointer" onClick={() => onTagClick(exactMatchTag)}>
            {chipBody(exactMatchTag)}
          </Tag>,
          "exact",
        )}
      {suggestedTags.map((tag, index) =>
        wrap(
          tag,
          <Tag className="pp-sug cursor-pointer" onClick={() => onTagClick(tag)}>
            {chipBody(tag)}
          </Tag>,
          index,
        ),
      )}
    </Flex>
  );
};
