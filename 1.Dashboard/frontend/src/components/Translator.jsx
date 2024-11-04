const saveTranslationToLocalStorage = (key, translatedText) => {
    localStorage.setItem(key, translatedText);
};

const getTranslationFromLocalStorage = (key) => {
    return localStorage.getItem(key);
};

const normalizeText = (text) => {
    return text.trim(); 
};

const isMeaningfulTranslation = (translatedText, targetLang) => {
    const twoCharLanguages = ['hi', 'zh', 'ja', 'en']; 
    return translatedText && (translatedText.length > 2 || (translatedText.length === 2 && twoCharLanguages.includes(targetLang)));
};

export const translateText = async (text, targetLang, uniqueKey) => {
    const cachedTranslation = getTranslationFromLocalStorage(uniqueKey);
    if (cachedTranslation) {
        return cachedTranslation; 
    }

    try {
        const response = await fetch('https://sebin35.pythonanywhere.com/translate_api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, target_lang: targetLang }),
        });

        if (!response.ok) {
            throw new Error(`Translation failed with status: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.translated_text;

        if (isMeaningfulTranslation(translatedText, targetLang)) {
            saveTranslationToLocalStorage(uniqueKey, translatedText);
        } else {
            console.warn(`Translation for "${text}" to "${targetLang}" may not be meaningful: "${translatedText}"`);
        }

        return translatedText;

    } catch (error) {
        console.error(`Error translating "${text}":`, error);
        throw error; 
    }
};

const translateTexts = async (texts, targetLang) => {
    return await Promise.all(
        texts.map(async (text) => {
            const uniqueKey = `${targetLang}-${normalizeText(text)}`; 
            return await translateText(text, targetLang, uniqueKey);
        })
    );
};

export const translateAllText = async (elements, targetLang) => {
    const translations = [];
    const uniqueKeys = [];
    const nodesToTranslate = [];

    for (const element of elements) {
        if (element.closest('.no-translate')) continue; 

        const childNodes = Array.from(element.childNodes);
        for (const node of childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const originalText = node.textContent.trim();

                const preservedText = originalText.replace(/(\d+(\.\d+)?)/g, (match) => `__NUM_${match}__`);

                const uniqueKey = `${targetLang}-${normalizeText(originalText)}`;
                const cachedTranslation = getTranslationFromLocalStorage(uniqueKey);

                if (cachedTranslation) {
                    node.textContent = cachedTranslation.replace(/__NUM_(\d+(\.\d+)?)__/g, '$1'); 
                } else {
                    translations.push(preservedText);
                    uniqueKeys.push(uniqueKey);
                    nodesToTranslate.push(node);
                }
            }
        }
    }

    if (translations.length > 0) {
        try {
            const translatedTexts = await translateTexts(translations, targetLang);
            
            for (let i = 0; i < nodesToTranslate.length; i++) {
                const finalText = translatedTexts[i].replace(/__NUM_(\d+(\.\d+)?)__/g, '$1');
                
                if (isMeaningfulTranslation(finalText, targetLang)) {
                    nodesToTranslate[i].textContent = finalText;
                    saveTranslationToLocalStorage(uniqueKeys[i], finalText); 
                } else {
                    console.warn(`Translated text for "${translations[i]}" is not meaningful: "${finalText}"`);
                    nodesToTranslate[i].textContent = nodesToTranslate[i].parentNode.getAttribute('data-original-text') || nodesToTranslate[i].textContent; 
                }
            }
        } catch (error) {
            console.error('Error translating text:', error);
            for (const node of nodesToTranslate) {
                node.textContent = node.parentNode.getAttribute('data-original-text') || node.textContent; 
            }
        }
    }
};


