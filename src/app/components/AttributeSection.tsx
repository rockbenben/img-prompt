import React, { FC, useCallback } from "react";
import { Button } from "antd";

interface AttributeSectionProps {
  attributes?: string[];
  selectedAttribute: string;
  onAttributeClick: (attribute: string) => void;
}

const AttributeSection: FC<AttributeSectionProps> = ({ attributes = [], selectedAttribute, onAttributeClick }) => {
  const handleClick = useCallback(
    (attribute: string) => {
      onAttributeClick(attribute);
    },
    [onAttributeClick]
  );

  if (attributes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attributes.map((attribute) => (
        <Button
          key={attribute}
          type={attribute === selectedAttribute ? "primary" : "default"}
          onClick={() => handleClick(attribute)}
          className="transition-all duration-200"
        >
          {attribute}
        </Button>
      ))}
    </div>
  );
};

export default AttributeSection;
