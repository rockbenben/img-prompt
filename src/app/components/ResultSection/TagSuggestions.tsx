import { FC } from "react";
import { Flex, Tag, Tooltip } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { tagLabels } from "@/app/utils/tagLabels";
import { TagItem } from "../types";

interface TagSuggestionsProps {
  suggestedTags: TagItem[];
  exactMatchTag: TagItem | null;
  onTagClick: (tag: TagItem) => void;
}

export const TagSuggestions: FC<TagSuggestionsProps> = ({ suggestedTags, exactMatchTag, onTagClick }) => {
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

  return (
    <Flex gap="6px 6px" wrap style={{ marginTop: 10 }}>
      {exactMatchTag && (
        <Tooltip title={tip(exactMatchTag)}>
          <Tag icon={<CheckCircleOutlined />} className="pp-sug pp-sug-exact cursor-pointer" onClick={() => onTagClick(exactMatchTag)}>
            {chipBody(exactMatchTag)}
          </Tag>
        </Tooltip>
      )}
      {suggestedTags.map((tag, index) => (
        <Tooltip key={index} title={tip(tag)}>
          <Tag className="pp-sug cursor-pointer" onClick={() => onTagClick(tag)}>
            {chipBody(tag)}
          </Tag>
        </Tooltip>
      ))}
    </Flex>
  );
};
