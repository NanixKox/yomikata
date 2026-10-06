chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_WORD") {
    fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(message.word)}`)
      .then(async res => {
        if (!res.ok) {
          throw new Error(`Jisho request failed: ${res.status}`);
        }

        return res.json();
      })
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));

    return true;
  }
});