import React from 'react';
import { Button } from 'antd';
import 'antd/dist/reset.css';

const AttributeSection = ({ attributes, selectedAttribute, onAttributeClick }) => {
  return (
    <div className="attribute-section">
      {attributes.map((attribute) => (
        <Button
          key={attribute}
          onClick={() => onAttributeClick(attribute)}
          className={`m-0.5 ${attribute === selectedAttribute ? 'bg-green-500' : ''}`}
        >
          {attribute}
        </Button>
      ))}
    </div>
  );
};

export default AttributeSection;
