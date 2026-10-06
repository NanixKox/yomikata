async function fetch_word(word) {
  const response = await chrome.runtime.sendMessage({
    type: "FETCH_WORD",
    word
  });

  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.data;
}

async function fetch_word1(word) {
    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);

    if (!response.ok) {
      throw new Error(response.error);
    }

    return response;
}