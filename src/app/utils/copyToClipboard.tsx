import { message } from "antd";

export const copyToClipboard = async (text: string, messageApi?: ReturnType<typeof message.useMessage>[0], successText?: string, errorText?: string) => {
  if (!text || text.trim() === "") {
    messageApi?.warning("It's empty. No need to copy.");
    return;
  }

  // 检查剪贴板 API 可用性
  if (!navigator?.clipboard) {
    messageApi?.error("Your current browser does not support clipboard operations. Please try copying manually or use a different browser.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    messageApi?.success(successText);
  } catch (err) {
    console.error(errorText, err);
    messageApi?.error(errorText);
  }
};
