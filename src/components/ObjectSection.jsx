// src/components/ObjectSection.jsx
import React from "react";
import { Button } from "antd";
import 'antd/dist/reset.css';

const ObjectSection = ({ objects, activeObject, onObjectClick }) => {
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
