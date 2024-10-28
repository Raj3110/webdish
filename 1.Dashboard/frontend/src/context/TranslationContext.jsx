import React, { createContext, useState, useContext } from 'react';
import { translateAllText } from '../components/Translator';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
    const [targetLang, setTargetLang] = useState('en'); 

    const translatePage = async () => {
        const elements = Array.from(document.body.querySelectorAll('*')).filter(
            (element) => element.childNodes.length > 0
        );
        await translateAllText(elements, targetLang);
    };

    const changeLanguage = async (lang) => {
        setTargetLang(lang);
        await translatePage(); 
    };

    return (
        <TranslationContext.Provider value={{ targetLang, changeLanguage }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => useContext(TranslationContext);
