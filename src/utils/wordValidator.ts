const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en";

export const validateWord = async (word: string): Promise<boolean> => {
  try {
    const res = await fetch(`${DICTIONARY_API}/${word.toLowerCase()}`);
    return res.ok;
  } catch {
    return false;
  }
};
