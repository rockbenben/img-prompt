import { App } from "antd";
import { useTranslations } from "next-intl";

export const useCopyToClipboard = () => {
  const t = useTranslations("CopyToClipboard");
  const { message: appMessage } = App.useApp();

  // 目标名（「提示词」/「Prompt」/「Négatif」）+ 整句消息。原来是裸拼接，
  // 中文碰巧读得通，其余语言全成了 "PromptCopy failed, please copy manually"
  // ——没有空格、也不成句。中间点分隔在所有语言里都成立，且不必假设
  // 目标名在句中的语法位置（那需要给 18 份文案逐句改写带占位符的版本）。
  const withTarget = (msg: string, targetText?: string) => (targetText ? `${targetText} · ${msg}` : msg);

  const copyToClipboard = async (text: string, targetText?: string) => {
    if (!text || text.trim() === "") {
      appMessage.warning(withTarget(t("empty"), targetText));
      return;
    }

    if (!navigator?.clipboard) {
      appMessage.error(t("unsupported"));
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      appMessage.success(withTarget(t("success"), targetText));
    } catch (err) {
      console.error("Copy to clipboard failed: ", err);
      appMessage.error(withTarget(t("failure"), targetText));
    }
  };

  return { copyToClipboard };
};
