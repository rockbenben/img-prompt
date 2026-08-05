import { normalizeString } from "./normalizeString";
import type { TagItem } from "@/app/components/types";

// 芯片里英文次级标签的显示上限。三处芯片（选词云 / 已选托盘 / 推荐词）的
// .pp-*-en 都只有 130–220px，约 20 个字符；再长的内容只会被省略号截成碎片。
const GLOSS_MAX = 40;

// 按显示宽度算而不是字符数：CJK / 假名 / 谚文 / 全角标点约占两个西文字符宽，
// 26 个汉字的句子和 26 个字母的词条在 140px 里是完全不同的两回事。
const displayWidth = (s: string) =>
  [...s].reduce((n, c) => n + (/[ᄀ-ᅟ⺀-鿿가-힯豈-﫿︰-﹏＀-｠￠-￦]/.test(c) ? 2 : 1), 0);

/**
 * 标签芯片的双语标签：母语为主、英文次级。
 *
 * displayName 并不总是一个词——成品范例是整段 prompt（最长 2257 字符），
 * 「冰魔法」这类聚合词条也有几百字符的逗号串。这种时候次级标签只剩
 * 「35mm film photography,…」这样的无意义开头，占着 160px 却什么都没说。
 * 有母语标题时直接不显示，完整内容点一下就进提示词框，悬停还有预览图。
 *
 * 没有母语标题时英文是唯一标签，无论多长都必须显示。
 */
export const tagLabels = (tag: TagItem) => {
  const gloss = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";
  return {
    gloss,
    en: gloss && displayWidth(tag.displayName) > GLOSS_MAX ? "" : tag.displayName,
  };
};
