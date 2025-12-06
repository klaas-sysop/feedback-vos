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
                <span className="text-xl leading-6">{t.form.header}</span>
                <CloseButton title={t.form.closeButton} />
            </header>
            <div className="flex py-8 gap-2 w-full">
                {
                    Object.entries(feedbackTypes).map(([key, value]) => {
                        return (
                            <button
                                key={key}
                                className="bg-zinc-800 rounded py-5 w-24 flex1 flex flex-col items-center gap-2 border-2 border-transparent hover:border-brand-500 focus:border-brand-500 focus:outline-none"
                                type="button"
                                onClick={() => onFeedbackTypeChanged(key as FeedbackType)}
                            >
                                <img src={value.image.source} alt={value.image.alt}></img>
                                <span>{value.title}</span>
                            </button>
                        )
                    })
                }
            </div>
        </>
    )
}

