export type Language = 'en' | 'nl';

export const translations = {
  en: {
    widget: {
      button: 'Feedback',
    },
    form: {
      header: 'Please give us your feedback!',
      closeButton: 'Close feedback form',
    },
    types: {
      bug: 'Bug',
      idea: 'Idea',
      other: 'Other',
    },
    content: {
      placeholder: 'Tell in detail what is happening',
      sendButton: 'Send feedback',
      error: 'Failed to send feedback. Please try again.',
    },
    success: {
      message: 'We appreciate the feedback',
      sendAnother: 'I want to send another',
    },
  },
  nl: {
    widget: {
      button: 'Feedback',
    },
    form: {
      header: 'Geef ons je feedback!',
      closeButton: 'Feedback formulier sluiten',
    },
    types: {
      bug: 'Bug',
      idea: 'Idee',
      other: 'Anders',
    },
    content: {
      placeholder: 'Vertel in detail wat er gebeurt',
      sendButton: 'Feedback versturen',
      error: 'Feedback versturen mislukt. Probeer het opnieuw.',
    },
    success: {
      message: 'Bedankt voor je feedback',
      sendAnother: 'Ik wil nog een sturen',
    },
  },
} as const;

export function getTranslations(lang: Language = 'en') {
  return translations[lang];
}

