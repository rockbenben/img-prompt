import React, { FC } from "react";
import { Button } from "antd";

interface AttributeSectionProps {
  attributes: string[];
  selectedAttribute: string;
  onAttributeClick: (attribute: string) => void;
}

const AttributeSection: FC<AttributeSectionProps> = ({
  attributes = [],
  selectedAttribute,
  onAttributeClick,
}) => {
  return (
    <div className="attribute-section">
      {attributes.map((attribute) => (
        <Button
          key={attribute}
          onClick={() => onAttributeClick(attribute)}
          className={`m-0.5 ${
            attribute === selectedAttribute ? "bg-green-500" : ""
          }`}
        >
          {attribute}
        </Button>
      ))}
    </div>
  );
};

export default AttributeSection;
