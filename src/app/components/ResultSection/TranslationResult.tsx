import { FC } from "react";
import { Collapse, Flex, Input, Spin, Typography } from "antd";

const { Text } = Typography;

interface TranslationResultProps {
  translatedText: string;
  isVisible: boolean;
  isTranslating?: boolean;
  t: (key: string) => string;
}

export const TranslationResult: FC<TranslationResultProps> = ({ translatedText, isVisible, isTranslating, t }) => {
  // 翻译中也要显示容器，给用户进度反馈；翻译完且无文本才隐藏
  if (!isVisible || (!translatedText && !isTranslating)) return null;

  const label = (
    <Flex align="center" gap={6}>
      {t("prompt-translation")}
      {isTranslating && (
        <>
          <Spin size="small" />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("translating")}
          </Text>
        </>
      )}
    </Flex>
  );

  return (
    <Collapse
      ghost
      size="small"
      defaultActiveKey={["translation"]}
      style={{ marginTop: 8 }}
      items={[
        {
          key: "translation",
          label,
          children: <Input.TextArea value={translatedText} readOnly autoSize={{ minRows: 3, maxRows: 8 }} aria-label={t("prompt-translation")} />,
        },
      ]}
    />
  );
};
