import React, { FC, useMemo } from "react";

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

const SelectedTagsSection: FC<SelectedTagsSectionProps> = ({ selectedTags = [], onTagClick }) => {
  // 按对象和属性对标签进行分组
  const tagsByObjectAndAttribute = useMemo(() => {
    return selectedTags.reduce<Record<string, Record<string, Tag[]>>>((acc, tag) => {
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

  return (
    <>
      {Object.entries(tagsByObjectAndAttribute).flatMap(([object, tagsByAttribute]) =>
        Object.entries(tagsByAttribute).map(([attribute, tags]) => (
          <React.Fragment key={`${object}-${attribute}`}>
            <span className="text-gray-500 ml-2">{object}</span>
            <span className="text-gray-500 ml-1">{attribute}</span>
            {tags.map((tag, index) => (
              <React.Fragment key={tag.displayName}>
                <div className="inline-block m-2 rounded cursor-pointer shadow-md transition duration-150 ease-in-out transform hover:scale-105" onClick={() => onTagClick(tag)}>
                  <span className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-2 py-1 rounded-l">
                    {tag.displayName.length > 20 ? tag.displayName.slice(0, 20) + "..." : tag.displayName}
                  </span>
                  <span className="bg-gradient-to-r from-teal-800 to-teal-900 text-white px-2 py-1 rounded-r">{tag.langName}</span>
                </div>
                {index === tags.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))
      )}
    </>
  );
};

export default SelectedTagsSection;
