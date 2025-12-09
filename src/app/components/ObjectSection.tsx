import React, { FC } from "react";
import { Radio, RadioChangeEvent } from "antd";

interface ObjectSectionProps {
  objects?: string[];
  activeObject: string;
  onObjectClick: (object: string) => void;
}

const ObjectSection: FC<ObjectSectionProps> = ({ objects = [], activeObject, onObjectClick }) => {
  if (objects.length === 0) {
    return null;
  }

  const handleChange = (e: RadioChangeEvent) => {
    onObjectClick(e.target.value);
  };

  return (
    <Radio.Group value={activeObject} onChange={handleChange} buttonStyle="solid" size="middle">
      {objects.map((object) => (
        <Radio.Button key={object} value={object}>
          {object}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};

export default ObjectSection;
