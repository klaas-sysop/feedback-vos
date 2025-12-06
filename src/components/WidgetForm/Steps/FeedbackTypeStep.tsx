'use client'

import { FeedbackType, feedbackTypes } from "..";
import { CloseButton } from "../../CloseButton";

interface FeedbackTypeStepProps {
    onFeedbackTypeChanged: (type: FeedbackType) => void;
}

export function FeedbackTypeStep({ onFeedbackTypeChanged }: FeedbackTypeStepProps) {
    return (
        <>
            <header className="flex items-center justify-between w-full gap-2">
                <span className="text-xl leading-6">Please give us your feedback!</span>
                <CloseButton />
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

