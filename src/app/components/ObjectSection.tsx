import React, { FC } from "react";
import { Button } from "antd";

interface ObjectSectionProps {
  objects: string[];
  activeObject: string;
  onObjectClick: (object: string) => void;
}

const ObjectSection: FC<ObjectSectionProps> = ({
  objects = [],
  activeObject,
  onObjectClick,
}) => {
  return (
    <div className="object-section">
      {objects.map((object, index) => (
        <Button
          key={index}
          className={`m-1 ${activeObject === object ? "bg-blue-500" : ""}`}
          onClick={() => onObjectClick(object)}
        >
          {object}
        </Button>
      ))}
    </div>
  );
};

export default ObjectSection;
