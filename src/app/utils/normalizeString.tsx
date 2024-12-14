export const normalizeString = (str: string | null | undefined) => {
  if (str == null) return ""; // handles both null and undefined
  return str.toLowerCase().replace(/[\s_-]+/g, " ");
};
// 小写并去除空格、连字符、下划线
