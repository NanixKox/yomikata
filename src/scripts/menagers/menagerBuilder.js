class MenagerBuilder{
    async waitForElement(querySelectorStr){
        return new Promise((resolve) => {
                const element = document.querySelector(querySelectorStr);

                if (element) {
                    resolve(element);
                    return;
                }

                const observeElement = new MutationObserver(() => {
                    const element = document.querySelector(querySelectorStr);

                    if (element) {
                        observeElement.disconnect();
                        resolve(element);
                    }
                });

                observeElement.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
    }
}