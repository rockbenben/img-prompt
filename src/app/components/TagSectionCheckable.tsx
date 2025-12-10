import React, { FC } from "react";
import { Tag, Tooltip, Flex, Typography, theme } from "antd";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";

const { Text } = Typography;
const { useToken } = theme;

interface TagSectionProps {
  tags?: TagItem[];
  selectedTags: TagItem[];
  onTagClick: (tag: TagItem) => void;
}

/**
 * TagSection - Ant Design Tag.CheckableTag 版本
 * 使用 Ant Design 主题色，单色标签设计
 */
const TagSectionCheckable: FC<TagSectionProps> = ({ tags = [], selectedTags, onTagClick }) => {
  const { token } = useToken();

  return (
    <div
      style={{
        maxHeight: 400,
        overflowY: "auto",
        padding: 8,
        border: `1px dashed ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
      }}>
      <Flex gap="small" wrap>
        {tags.map((tag) => {
          const isSelected = selectedTags.some((t) => t.displayName === tag.displayName);
          const tagDisplayName = tag.displayName.length > 20 ? `${tag.displayName.slice(0, 20)}...` : tag.displayName;
          const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";

          const tagContent = (
            <Tag.CheckableTag
              key={`${tag.object}-${tag.attribute}-${tag.displayName}`}
              checked={isSelected}
              onChange={() => onTagClick(tag)}
              style={{
                border: `1px solid ${token.colorBorder}`,
                backgroundColor: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
              }}>
              <Text style={{ color: isSelected ? token.colorPrimaryText : token.colorText }}>{tagDisplayName}</Text>
              {tagLangName && (
                <Text type="secondary" style={{ marginLeft: 4 }}>
                  {tagLangName}
                </Text>
              )}
            </Tag.CheckableTag>
          );

          // 如果有description，就用Tooltip包装
          return tag.description ? (
            <Tooltip key={`${tag.object}-${tag.attribute}-${tag.displayName}`} title={tag.description} placement="top">
              {tagContent}
            </Tooltip>
          ) : (
            tagContent
          );
        })}
      </Flex>
    </div>
  );
};

export default TagSectionCheckable;
