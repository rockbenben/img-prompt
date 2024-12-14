export const translateText = async (text: string, sourceLanguage: string, targetLanguage: string) => {
  const trimmedText = text.trim();
  if (!/[a-zA-Z\p{L}]/u.test(trimmedText)) {
    return trimmedText;
  }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(trimmedText)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data[0].map((part: any) => part[0]).join("");
};
