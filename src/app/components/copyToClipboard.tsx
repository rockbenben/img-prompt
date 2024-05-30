import { message } from "antd";

export const copyToClipboard = async (text: string, successText?: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success(successText ? `${successText} 已成功复制到剪贴板` : "文本已成功复制到剪贴板");
  } catch (err) {
    message.error("复制失败，请手动复制内容");
  }
};
