import React, { FC } from "react";

interface ObjectSectionProps {
  objects: string[];
  activeObject: string;
  onObjectClick: (object: string) => void;
}

const ObjectSection: FC<ObjectSectionProps> = ({ objects = [], activeObject, onObjectClick }) => {
  return (
    <div className="flex flex-wrap">
      {objects.map((object, index) => (
        <button
          key={index}
          onClick={() => onObjectClick(object)}
          className={`m-1 px-3 py-1 text-sm font-medium leading-5 transition-colors duration-150 rounded-lg focus:outline-none border ${
            activeObject === object ? "bg-teal-500 text-white border-teal-500" : "text-gray-500 border-gray-300 hover:bg-gray-50"
          }`}>
          {object}
        </button>
      ))}
    </div>
  );
};

export default ObjectSection;
