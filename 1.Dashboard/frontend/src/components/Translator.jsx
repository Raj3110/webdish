// Function to save a translation to local storage
const saveTranslationToLocalStorage = (key, translatedText) => {
    localStorage.setItem(key, translatedText);
};

const getTranslationFromLocalStorage = (key) => {
    return localStorage.getItem(key);
};

// Function to translate individual text and store in local storage
export const translateText = async (text, targetLang, uniqueKey) => {
    const cachedTranslation = getTranslationFromLocalStorage(uniqueKey);
    if (cachedTranslation) {
        return cachedTranslation; 
    }

    const response = await fetch('https://sebin35.pythonanywhere.com/translate_api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, target_lang: targetLang }),
    });

    if (!response.ok) {
        throw new Error('Translation failed');
    }

    const data = await response.json();
    const translatedText = data.translated_text;

    
    saveTranslationToLocalStorage(uniqueKey, translatedText);
    return translatedText;
};


export const translateAllText = async (elements, targetLang) => {
    for (const element of elements) {
        if (element.closest('.no-translate')) continue; 

        const childNodes = Array.from(element.childNodes);
        for (const node of childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (!node.parentNode.hasAttribute('data-original-text')) {
                    node.parentNode.setAttribute('data-original-text', node.textContent.trim());
                }

                const originalText = node.parentNode.getAttribute('data-original-text');
                if (originalText) {
                    const uniqueKey = `${targetLang}-${originalText}`; 
                    try {
                        const translatedText = await translateText(originalText, targetLang, uniqueKey);
                        node.textContent = translatedText; 
                    } catch (error) {
                        console.error('Error translating text:', error);
                    }
                }
            }
        }
    }
};
