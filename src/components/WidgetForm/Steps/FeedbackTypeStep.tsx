'use client'

import { FeedbackType, getFeedbackTypes } from "..";
import { CloseButton } from "../../CloseButton";
import { Language, getTranslations } from "../../../lib/translations";
import { Theme } from "../../../types";
import { getThemeClasses } from "../../../lib/theme";

interface FeedbackTypeStepProps {
    onFeedbackTypeChanged: (type: FeedbackType) => void;
    language: Language;
    theme: Theme;
}

export function FeedbackTypeStep({ onFeedbackTypeChanged, language, theme }: FeedbackTypeStepProps) {
    const t = getTranslations(language);
    const feedbackTypes = getFeedbackTypes(language);
    const themeClasses = getThemeClasses(theme);
    
    return (
        <>
            <header className={`flex items-center justify-between w-full gap-2 ${theme === 'light' ? 'pb-3 mb-2 border-b border-gray-200' : 'pb-2'}`}>
                <span className={`text-lg md:text-xl leading-6 font-semibold ${themeClasses.textPrimary}`}>{t.form.header}</span>
                <CloseButton title={t.form.closeButton} theme={theme} />
            </header>
            <div className="flex py-6 md:py-8 gap-2 md:gap-2 w-full justify-center md:justify-start flex-wrap">
                {
                    Object.entries(feedbackTypes).map(([key, value]) => {
                        return (
                            <button
                                key={key}
                                className={`${themeClasses.bgSecondary} rounded-lg py-4 md:py-5 flex-1 min-w-[80px] md:w-24 flex flex-col items-center gap-2 border-2 ${theme === 'light' ? 'border-gray-200' : 'border-transparent'} hover:border-brand-500 focus:border-brand-500 focus:outline-none transition-all shadow-sm hover:shadow-md ${theme === 'light' ? 'hover:bg-white' : ''}`}
                                type="button"
                                onClick={() => onFeedbackTypeChanged(key as FeedbackType)}
                            >
                                <img src={value.image.source} alt={value.image.alt} className="w-5 h-5 md:w-6 md:h-6"></img>
                                <span className={`text-xs md:text-sm text-center font-medium ${themeClasses.textPrimary}`}>{value.title}</span>
                            </button>
                        )
                    })
                }
            </div>
        </>
    )
}

