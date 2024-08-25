export const translateText = async (text: string, sourceLanguage: string, targetLanguage: string) => {
  if (text.trim() === "") {
    return text;
  }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data[0].map((part: any) => part[0]).join("");
};
