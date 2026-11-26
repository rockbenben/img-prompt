import React, { FC, useEffect, useRef } from "react";
import { Radio, type RadioChangeEvent } from "antd";

interface CategoryRadioProps {
  className: string;
  label: string;
  items?: string[];
  value: string;
  counts?: Map<string, number>;
  onChange: (value: string) => void;
}

const CategoryRadio: FC<CategoryRadioProps> = ({ className, label, items = [], value, counts, onChange }) => {
  const groupRef = useRef<HTMLDivElement>(null);

  // 窄屏横滑时将选中项滚入视野，从分享链接进入时也可见当前分类
  useEffect(() => {
    groupRef.current?.querySelector(".ant-radio-button-wrapper-checked")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [value]);

  if (items.length === 0) return null;

  return (
    <Radio.Group ref={groupRef} aria-label={label} className={className} value={value} onChange={(e: RadioChangeEvent) => onChange(e.target.value)} buttonStyle="solid" size="middle">
      {items.map((item) => {
        const count = counts?.get(item) ?? 0;
        return (
          <Radio.Button key={item} value={item}>
            <span className="pp-cat-label">{item}</span>
            {count > 0 && <span className="pp-cat-count">{count}</span>}
          </Radio.Button>
        );
      })}
    </Radio.Group>
  );
};

export default CategoryRadio;
