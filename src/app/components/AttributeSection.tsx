import React, { FC } from "react";
import { Radio, RadioChangeEvent } from "antd";

interface AttributeSectionProps {
  attributes?: string[];
  selectedAttribute: string;
  onAttributeClick: (attribute: string) => void;
}

const AttributeSection: FC<AttributeSectionProps> = ({ attributes = [], selectedAttribute, onAttributeClick }) => {
  if (attributes.length === 0) {
    return null;
  }

  const handleChange = (e: RadioChangeEvent) => {
    onAttributeClick(e.target.value);
  };

  return (
    <Radio.Group value={selectedAttribute} onChange={handleChange} buttonStyle="solid" size="middle">
      {attributes.map((attribute) => (
        <Radio.Button key={attribute} value={attribute}>
          {attribute}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};

export default AttributeSection;
