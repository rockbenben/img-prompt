import { message } from "antd";

export const copyToClipboard = async (text: string, successText?: string) => {
  if (!navigator?.clipboard) {
    message.error("当前浏览器不支持剪贴板操作，请手动复制内容");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    message.success(successText ? `${successText} 已成功复制到剪贴板` : "文本已成功复制到剪贴板");
  } catch (err) {
    console.error("复制到剪贴板失败：", err);
    message.error("复制失败，请手动复制内容");
  }
};
