import React, { FC, useState, useEffect, useCallback } from "react";
import { Button, Input, message, Tooltip, Typography, Space } from "antd";
import { copyToClipboard } from "./copyToClipboard";

const NEGATIVE_TEXT =
  "(worst quality:2), (low quality:2), (normal quality:2), lowres, jpeg artifacts, blurry, ((monochrome)), ((grayscale)), ugly, duplicate, morbid, mutilated, mutation, deformed, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, missing fingers, extra digit, fewer digits, fused fingers, too many fingers, bad anatomy, bad hands, bad feet, malformed limbs, extra limbs, extra arms, extra legs, missing arms, missing legs, extra foot, bad body, bad proportions, gross proportions, facing away, looking away, tilted head, long neck, cross-eyed, skin spots, acnes, skin blemishes, (fat:1.2), polar lowres, teethcropped, dehydrated, text, error, cropped, out of frame, signature, watermark, username,";

const CONSTANT_TEXT_1 = "Natural Lighting, Studio lighting, Cinematic Lighting, Crepuscular Rays, X-Ray, Backlight";
const CONSTANT_TEXT_2 =
  "insanely detailed and intricate, gorgeous, Surrealistic, smooth, sharp focus, Painting, Digital Art, Concept Art, Illustration, Trending on ArtStation, in a symbolic and meaningful style, 8K";

interface Tag {
  attribute: string | undefined;
  displayName: string | undefined;
  langName: string | undefined;
  object: string | undefined;
}

interface ResultSectionProps {
  selectedTags: Tag[];
  setSelectedTags: (tags: Tag[]) => void;
  tagsData: Tag[];
}

const ResultSection: FC<ResultSectionProps> = ({ selectedTags = [], setSelectedTags, tagsData }) => {
  const [resultText, setResultText] = useState(selectedTags.map((tag) => tag.displayName).join(", "));
  const [charCount, setCharCount] = useState(resultText.length);

  useEffect(() => {
    const newText = selectedTags
      .map((tag) => tag.displayName)
      .filter((displayName) => displayName && displayName.trim() !== "")
      .join(", ");
    setResultText(newText);
    setCharCount(newText.length);
  }, [selectedTags]);

  const handleClear = useCallback(() => {
    setSelectedTags([]);
    setCharCount(0);
    message.success("已清空结果框");
  }, [setSelectedTags]);

  const findTagData = useCallback(
    (displayName: string) => {
      let foundTag = tagsData.find((tag) => tag.displayName?.toLowerCase() === displayName.toLowerCase());
      if (!foundTag) {
        const modifiedDisplayName = displayName.replace(/ /g, "_");
        foundTag = tagsData.find((tag) => tag.displayName?.toLowerCase() === modifiedDisplayName.toLowerCase());
      }
      if (foundTag) {
        return {
          object: foundTag.object,
          attribute: foundTag.attribute,
          langName: foundTag.langName,
          displayName: foundTag.displayName,
        };
      }
      return {
        object: undefined,
        attribute: undefined,
        langName: undefined,
        displayName: undefined,
      };
    },
    [tagsData]
  );

  const handleConstantText = useCallback(
    (constantText: string) => {
      const newText = resultText ? resultText + ", " + constantText : constantText;
      const displayNames = newText.split(", ");
      const uniqueDisplayNames = Array.from(new Set(displayNames));

      const newSelectedTags = uniqueDisplayNames.map((displayName) => {
        const { object, attribute, langName, displayName: foundDisplayName } = findTagData(displayName);
        return {
          object,
          displayName: foundDisplayName || displayName,
          attribute,
          langName,
        };
      });

      setSelectedTags(newSelectedTags);
      setResultText(uniqueDisplayNames.join(", "));
      message.success("已插入指定文本");
      setCharCount(uniqueDisplayNames.join(", ").length);
    },
    [resultText, findTagData, setSelectedTags]
  );

  const handleResultTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setResultText(newText);
      setCharCount(newText.length);

      const newSelectedTags = newText
        .split(", ")
        .filter((displayName) => displayName && displayName.trim() !== "")
        .map((displayName) => {
          const { object, attribute, langName } = findTagData(displayName);
          return { object, displayName, attribute, langName };
        });
      setSelectedTags(newSelectedTags);
    },
    [findTagData, setSelectedTags]
  );

  const handleBlur = useCallback(() => {
    const replacedText = resultText
      .replace(/，/g, ", ")
      .replace(/,(\s{0,1})/g, ", ")
      .replace(/(,\s*){2,}/g, ", ");

    const displayNames = replacedText.split(", ").filter((name) => name.trim() !== "");
    const uniqueDisplayNames = Array.from(new Set(displayNames.map((displayName) => displayName.toLowerCase())));

    const uniqueSelectedTags = uniqueDisplayNames.map((displayName) => {
      const { object, attribute, langName, displayName: foundDisplayName } = findTagData(displayName);
      return {
        object,
        displayName: foundDisplayName || displayName,
        attribute,
        langName,
      };
    });

    const filteredSelectedTags = uniqueSelectedTags.filter((tag) => tag.displayName && tag.displayName.trim() !== "");

    setSelectedTags(filteredSelectedTags);

    const newText = filteredSelectedTags.map((tag) => tag.displayName).join(", ");
    setResultText(newText);
    setCharCount(newText.length);
  }, [resultText, findTagData, setSelectedTags]);

  return (
    <>
      <Space wrap>
        <Tooltip title="插入肖像常用光线">
          <Button type="primary" onClick={() => handleConstantText(CONSTANT_TEXT_1)}>
            肖像光线
          </Button>
        </Tooltip>
        <Tooltip title="插入常用图像润色词">
          <Button type="primary" onClick={() => handleConstantText(CONSTANT_TEXT_2)}>
            常用润色
          </Button>
        </Tooltip>
        <Tooltip title="复制 Negative prompt 常用否定提示词">
          <Button type="dashed" onClick={() => copyToClipboard(NEGATIVE_TEXT, "常用否定提示词")}>
            否定提示
          </Button>
        </Tooltip>
        <Button onClick={() => copyToClipboard(resultText, "结果提示词")}>复制结果</Button>
        <Button danger onClick={handleClear}>
          清空
        </Button>
      </Space>
      <Input.TextArea value={resultText} onChange={handleResultTextChange} onBlur={handleBlur} rows={10} className="w-full mt-2" style={{ backgroundColor: "#333", color: "#d3d3d3" }} />
      <Typography.Text style={{ display: "block", color: charCount > 380 ? "#ff4d4f" : "#d3d3d3" }} className="mt-2">
        {charCount}/380
      </Typography.Text>
      <Typography.Paragraph style={{ color: "#b0b0b0" }}>
        Tips：Prompt 中的词语顺序代表其权重，越靠前权重越大。物体不要太多，两到三个就好。若要特别强调某个元素，可以加很多括号或者惊叹号，比如 beautiful forest background, desert!!, (((sunset)))
        中会优先体现「desert」和「sunset」元素。
        <br />
        假设你在提示词中使用了 mountain，生成的图像很可能会有树。但如果你想要生成没有树的山的图像，可以使用 mountain | tree:-10。其中 tree:-10 表示对于树的权重非常负，因此生成的图像中不会出现树。
      </Typography.Paragraph>
    </>
  );
};

export default ResultSection;
