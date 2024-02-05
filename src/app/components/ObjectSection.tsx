import React, { FC } from "react";
import { Button } from "antd";

interface ObjectSectionProps {
  objects: string[];
  activeObject: string;
  onObjectClick: (object: string) => void;
}

const ObjectSection: FC<ObjectSectionProps> = ({ objects = [], activeObject, onObjectClick }) => {
  return (
    <div className="object-section">
      {objects.map((object, index) => (
        <Button
          key={index}
          onClick={() => onObjectClick(object)}
          style={{
            margin: "5px",
            backgroundColor: activeObject === object ? "#70c282" : undefined,
          }}>
          {object}
        </Button>
      ))}
    </div>
  );
};

export default ObjectSection;
