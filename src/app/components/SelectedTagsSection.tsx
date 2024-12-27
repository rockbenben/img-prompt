import React, { FC, useMemo } from "react";
import { Tag, Typography, Space, theme } from "antd";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";
import { useTheme } from "next-themes";

const { Text } = Typography;

interface SelectedTagsSectionProps {
  selectedTags: TagItem[];
  onTagClick: (tag: TagItem) => void;
}

const SelectedTagsSection: FC<SelectedTagsSectionProps> = ({ selectedTags = [], onTagClick }) => {
  // Get the current theme token
  const { theme } = useTheme();

  // Group tags by object and attribute
  const tagsByObjectAndAttribute = useMemo(() => {
    return selectedTags.reduce<Record<string, Record<string, TagItem[]>>>((acc, tag) => {
      if (!acc[tag.object]) {
        acc[tag.object] = {};
      }
      if (!acc[tag.object][tag.attribute]) {
        acc[tag.object][tag.attribute] = [];
      }
      acc[tag.object][tag.attribute].push(tag);
      return acc;
    }, {});
  }, [selectedTags]);

  // If no tags, return null
  if (selectedTags.length === 0) {
    return null;
  }

  return (
    <div className={`p-3 rounded-lg ${theme === "light" ? "bg-gray-50" : "bg-gray-800"}`}>
      {Object.entries(tagsByObjectAndAttribute).map(([object, tagsByAttribute]) => (
        <div key={object} className="mb-4">
          <Text strong className={`mb-2 text-gray-400`}>
            {object}
          </Text>
          {Object.entries(tagsByAttribute).map(([attribute, tags]) => (
            <div key={`${object}-${attribute}`} className="mb-3">
              <Text type="secondary" className="mr-2 text-gray-400">
                {attribute}:
              </Text>
              <Space size={[8, 8]} wrap>
                {tags.map((tag) => {
                  // Truncate display name if too long
                  const tagDisplayName = tag.displayName.length > 20 ? `${tag.displayName.slice(0, 20)}...` : tag.displayName;
                  const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";

                  return (
                    <Tag
                      key={tag.displayName}
                      color="blue"
                      onClick={() => onTagClick(tag)}
                      className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                      }}>
                      <Space size={4} align="center">
                        <span className="font-medium">{tagDisplayName}</span>
                        <Text type="secondary" className="text-xs">
                          {tagLangName}
                        </Text>
                      </Space>
                    </Tag>
                  );
                })}
              </Space>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SelectedTagsSection;
