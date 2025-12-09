import React, { FC, useMemo } from "react";
import { Tag, Typography, Space, Collapse, Empty, CollapseProps } from "antd";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";
import { useTranslations } from "next-intl";

const { Text } = Typography;

interface SelectedTagsSectionProps {
  selectedTags: TagItem[];
  onTagClick: (tag: TagItem) => void;
}

const SelectedTagsSection: FC<SelectedTagsSectionProps> = ({ selectedTags = [], onTagClick }) => {
  const t = useTranslations("ToolPage");

  // Group tags by object and attribute
  const tagsByObjectAndAttribute = useMemo(() => {
    return selectedTags.reduce<Record<string, Record<string, TagItem[]>>>((acc, tag) => {
      const objectKey = tag.object || t("fallback-other");
      const attributeKey = tag.attribute || t("fallback-uncategorized");
      if (!acc[objectKey]) {
        acc[objectKey] = {};
      }
      if (!acc[objectKey][attributeKey]) {
        acc[objectKey][attributeKey] = [];
      }
      acc[objectKey][attributeKey].push(tag);
      return acc;
    }, {});
  }, [selectedTags, t]);

  // Get all keys to keep all panels expanded
  const allKeys = Object.keys(tagsByObjectAndAttribute);

  // If no tags, return empty state
  if (selectedTags.length === 0) {
    return <Empty description={t("empty-selected-tags")} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const items: CollapseProps["items"] = Object.entries(tagsByObjectAndAttribute).map(([object, tagsByAttribute]) => ({
    key: object,
    label: (
      <Text strong>
        {object} ({Object.values(tagsByAttribute).flat().length})
      </Text>
    ),
    children: (
      <Space orientation="vertical" size="small" style={{ width: "100%" }}>
        {Object.entries(tagsByAttribute).map(([attribute, tags]) => (
          <div key={attribute}>
            <Text type="secondary" style={{ marginRight: 8 }}>
              {attribute}:
            </Text>
            <Space size={[4, 4]} wrap>
              {tags.map((tag) => {
                const tagDisplayName = tag.displayName.length > 20 ? `${tag.displayName.slice(0, 20)}...` : tag.displayName;
                const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";

                return (
                  <Tag
                    key={tag.displayName}
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      onTagClick(tag);
                    }}
                    color="blue">
                    {tagDisplayName}
                    {tagLangName && (
                      <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
                        {tagLangName}
                      </Text>
                    )}
                  </Tag>
                );
              })}
            </Space>
          </div>
        ))}
      </Space>
    ),
  }));

  // Use activeKey (controlled) instead of defaultActiveKey to ensure all panels stay expanded
  return <Collapse size="small" activeKey={allKeys} items={items} style={{ marginTop: 8 }} />;
};

export default SelectedTagsSection;
