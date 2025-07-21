import React, { FC, useCallback } from "react";
import { Button } from "antd";

interface ObjectSectionProps {
  objects?: string[];
  activeObject: string;
  onObjectClick: (object: string) => void;
}

const ObjectSection: FC<ObjectSectionProps> = ({ objects = [], activeObject, onObjectClick }) => {
  const handleClick = useCallback(
    (object: string) => {
      onObjectClick(object);
    },
    [onObjectClick]
  );

  if (objects.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {objects.map((object) => (
        <Button key={object} type={activeObject === object ? "primary" : "default"} onClick={() => handleClick(object)} className="transition-all duration-200">
          {object}
        </Button>
      ))}
    </div>
  );
};

export default ObjectSection;
