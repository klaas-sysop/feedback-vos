'use client'

import { FeedbackType, getFeedbackTypes } from "..";
import { CloseButton } from "../../CloseButton";
import { Language, getTranslations } from "../../../lib/translations";

interface FeedbackTypeStepProps {
    onFeedbackTypeChanged: (type: FeedbackType) => void;
    language: Language;
}

export function FeedbackTypeStep({ onFeedbackTypeChanged, language }: FeedbackTypeStepProps) {
    const t = getTranslations(language);
    const feedbackTypes = getFeedbackTypes(language);
    
    return (
        <>
            <header className="flex items-center justify-between w-full gap-2">
                <span className="text-lg md:text-xl leading-6">{t.form.header}</span>
                <CloseButton title={t.form.closeButton} />
            </header>
            <div className="flex py-6 md:py-8 gap-2 md:gap-2 w-full justify-center md:justify-start flex-wrap">
                {
                    Object.entries(feedbackTypes).map(([key, value]) => {
                        return (
                            <button
                                key={key}
                                className="bg-zinc-800 rounded py-4 md:py-5 flex-1 min-w-[80px] md:w-24 flex flex-col items-center gap-2 border-2 border-transparent hover:border-brand-500 focus:border-brand-500 focus:outline-none transition-colors"
                                type="button"
                                onClick={() => onFeedbackTypeChanged(key as FeedbackType)}
                            >
                                <img src={value.image.source} alt={value.image.alt} className="w-5 h-5 md:w-6 md:h-6"></img>
                                <span className="text-xs md:text-sm text-center">{value.title}</span>
                            </button>
                        )
                    })
                }
            </div>
        </>
    )
}

