import { FC } from "react";
import { Flex, Tag, Tooltip, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "../types";

const { Text } = Typography;

interface TagSuggestionsProps {
  suggestedTags: TagItem[];
  exactMatchTag: TagItem | null;
  onTagClick: (tag: TagItem) => void;
}

export const TagSuggestions: FC<TagSuggestionsProps> = ({ suggestedTags, exactMatchTag, onTagClick }) => {
  if (!exactMatchTag && suggestedTags.length === 0) return null;

  return (
    <Flex gap="4px 4px" wrap>
      {exactMatchTag && (
        <Tooltip title={exactMatchTag.langName !== exactMatchTag.displayName ? `${exactMatchTag.langName} - ${exactMatchTag.displayName}` : exactMatchTag.displayName}>
          <Tag icon={<CheckCircleOutlined />} color="success" className="cursor-pointer" onClick={() => onTagClick(exactMatchTag)}>
            <Text type="secondary" ellipsis style={{ maxWidth: 80, display: "inline-block", verticalAlign: "bottom" }}>
              {exactMatchTag.langName}
            </Text>
            <Text ellipsis style={{ marginLeft: 4, maxWidth: 120, display: "inline-block", verticalAlign: "bottom" }}>
              {exactMatchTag.displayName}
            </Text>
          </Tag>
        </Tooltip>
      )}
      {suggestedTags.map((tag, index) => {
        const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";
        return (
          <Tooltip key={index} title={tagLangName ? `${tagLangName} - ${tag.displayName}` : tag.displayName}>
            <Tag color="processing" className="cursor-pointer" onClick={() => onTagClick(tag)}>
              {tagLangName && (
                <Text type="secondary" ellipsis style={{ maxWidth: 80, display: "inline-block", verticalAlign: "bottom" }}>
                  {tagLangName}
                </Text>
              )}
              <Text ellipsis style={{ marginLeft: tagLangName ? 4 : 0, maxWidth: 120, display: "inline-block", verticalAlign: "bottom" }}>
                {tag.displayName}
              </Text>
            </Tag>
          </Tooltip>
        );
      })}
    </Flex>
  );
};
