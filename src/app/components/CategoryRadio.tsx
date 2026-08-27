import React, { FC, useEffect, useRef } from "react";
import { Radio, RadioChangeEvent } from "antd";

interface CategoryRadioProps {
  // 主体行用 pp-cats，属性行用 pp-subs（两套描边/选中样式见 globals.css）
  className: string;
  items?: string[];
  value: string;
  onChange: (value: string) => void;
}

const CategoryRadio: FC<CategoryRadioProps> = ({ className, items = [], value, onChange }) => {
  const groupRef = useRef<HTMLDivElement>(null);

  // 窄屏下这两行是限高内滚的（见 globals.css）。用户自己点的那颗当然在视野里，
  // 但从分享链接（#object=15）进来时选中项可能落在滚动区外 —— 页面上没有第二处
  // 显示当前分类，用户会以为链接没生效。block/inline: "nearest" 只在真的不可见
  // 时才滚，且滚最小距离，因此点击路径上等于 no-op。
  useEffect(() => {
    groupRef.current?.querySelector(".ant-radio-button-wrapper-checked")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value]);

  if (items.length === 0) return null;

  return (
    <Radio.Group ref={groupRef} className={className} value={value} onChange={(e: RadioChangeEvent) => onChange(e.target.value)} buttonStyle="solid" size="middle">
      {items.map((item) => (
        <Radio.Button key={item} value={item}>
          {item}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};

export default CategoryRadio;
