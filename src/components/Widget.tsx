'use client'

import { ChatTeardropDots } from 'phosphor-react';
import { Popover } from '@headlessui/react';
import { WidgetForm } from './WidgetForm';
import { WidgetProps } from '../types';
import { getTranslations } from '../lib/translations';

function getDefaultLanguage(): 'en' | 'nl' {
  // Check environment variable (works in Next.js client-side)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FEEDBACK_LANG === 'nl') {
    return 'nl';
  }
  return 'en';
}

export function Widget({ 
  integration, 
  githubConfig,
  position = 'bottom-right',
  language,
}: WidgetProps) {
  const finalLanguage = language || getDefaultLanguage();
  const t = getTranslations(finalLanguage);
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 md:bottom-8 md:right-8',
    'bottom-left': 'bottom-4 left-4 md:bottom-8 md:left-8',
    'top-right': 'top-4 right-4 md:top-8 md:right-8',
    'top-left': 'top-4 left-4 md:top-8 md:left-4',
  };

  const alignmentClass = position.includes('left') ? 'items-start' : 'items-end';

  return (
    <Popover className={`fixed ${positionClasses[position]} flex flex-col ${alignmentClass} z-50`}>
      <Popover.Panel>
        <WidgetForm 
          integration={integration}
          githubConfig={githubConfig}
          language={finalLanguage}
        />
      </Popover.Panel>
      <Popover.Button className="bg-brand-500 rounded-full px-3 md:px-3 h-12 text-white flex items-center group focus:outline-none shadow-lg hover:shadow-xl transition-shadow">
        <ChatTeardropDots className="w-6 h-6 flex-shrink-0" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs md:group-hover:max-w-xs transition-all duration-500 ease-linear hidden md:block">
          <span className="pl-2"></span>
          {t.widget.button}
        </span>
      </Popover.Button>
    </Popover>
  )
}

