import React, { FC } from "react";
import { Button } from "antd";

interface AttributeSectionProps {
  attributes: string[];
  selectedAttribute: string;
  onAttributeClick: (attribute: string) => void;
}

const AttributeSection: FC<AttributeSectionProps> = ({ attributes = [], selectedAttribute, onAttributeClick }) => {
  return (
    <div className="attribute-section">
      {attributes.map((attribute) => (
        <Button
          key={attribute}
          onClick={() => onAttributeClick(attribute)}
          style={{
            margin: "2px",
            backgroundColor: attribute === selectedAttribute ? "#a8a8a8" : undefined,
          }}>
          {attribute}
        </Button>
      ))}
    </div>
  );
};

export default AttributeSection;
