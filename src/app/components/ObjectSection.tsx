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

  return (
    <div className="flex flex-wrap">
      {objects.map((object) => (
        <Button
          key={object}
          onClick={() => handleClick(object)}
          className={`m-1 px-3 py-1 text-sm font-medium leading-5 transition-colors duration-150 rounded-lg focus:outline-none border ${
            activeObject === object ? "bg-teal-500 text-white border-teal-500" : ""
          }`}>
          {object}
        </Button>
      ))}
    </div>
  );
};

export default ObjectSection;
