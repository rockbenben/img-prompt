import React, { FC } from "react";
import { Radio, RadioChangeEvent } from "antd";

interface CategoryRadioProps {
  // 主体行用 pp-cats，属性行用 pp-subs（两套描边/选中样式见 globals.css）
  className: string;
  items?: string[];
  value: string;
  onChange: (value: string) => void;
}

const CategoryRadio: FC<CategoryRadioProps> = ({ className, items = [], value, onChange }) => {
  if (items.length === 0) return null;

  return (
    <Radio.Group className={className} value={value} onChange={(e: RadioChangeEvent) => onChange(e.target.value)} buttonStyle="solid" size="middle">
      {items.map((item) => (
        <Radio.Button key={item} value={item}>
          {item}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};

export default CategoryRadio;
