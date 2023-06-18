import React, { FC } from "react";

interface Tag {
  object: string;
  attribute: string;
  displayName: string;
  langName: string;
}

interface SelectedTagsSectionProps {
  selectedTags: Tag[];
  onTagClick: (tag: Tag) => void;
}

const SelectedTagsSection: FC<SelectedTagsSectionProps> = ({
  selectedTags = [],
  onTagClick,
}) => {
  // 按对象和属性对标签进行分组
  const tagsByObjectAndAttribute = selectedTags.reduce<
    Record<string, Record<string, Tag[]>>
  >((acc, tag) => {
    if (!acc[tag.object]) {
      acc[tag.object] = {};
    }
    if (!acc[tag.object][tag.attribute]) {
      acc[tag.object][tag.attribute] = [];
    }
    acc[tag.object][tag.attribute].push(tag);
    return acc;
  }, {});

  return (
    <div className="selected-tags-section">
      {Object.entries(tagsByObjectAndAttribute).flatMap(
        ([object, tagsByAttribute]) =>
          Object.entries(tagsByAttribute).map(
            ([attribute, tags], attributeIndex) => (
              <React.Fragment key={attribute}>
                <span className="text-gray-500 ml-2">{object}</span>
                <span className="text-gray-500 ml-2">{attribute}</span>
                {(tags as Tag[]).map((tag, index) => (
                  <React.Fragment key={tag.displayName}>
                    <div
                      className="inline-block m-2 rounded"
                      onClick={() => onTagClick(tag)}
                    >
                      <span className="bg-green-800 text-white px-2 py-1 rounded-l">
                        {tag.displayName}
                      </span>
                      <span className="bg-green-600 text-white px-2 py-1 rounded-r">
                        {tag.langName}
                      </span>
                    </div>
                    {index === tags.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </React.Fragment>
            )
          )
      )}
    </div>
  );
};

export default SelectedTagsSection;
