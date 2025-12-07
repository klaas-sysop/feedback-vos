'use client'

import { ChatTeardropDots } from 'phosphor-react';
import { Popover } from '@headlessui/react';
import { WidgetForm } from './WidgetForm';
import { WidgetProps } from '../types';
import { getTranslations } from '../lib/translations';
import { getDefaultTheme } from '../lib/theme';

function getDefaultLanguage(): 'en' | 'nl' {
  // Check environment variable (works in Next.js client-side)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FEEDBACK_LANG === 'nl') {
    return 'nl';
  }
  return 'en';
}

function isWidgetEnabled(): boolean {
  // Check environment variable to enable/disable widget
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FEEDBACK_ENABLED !== undefined) {
    const enabled = String(process.env.NEXT_PUBLIC_FEEDBACK_ENABLED).toLowerCase().trim();
    // Disable only if explicitly set to 'false' or '0'
    return enabled !== 'false' && enabled !== '0';
  }
  // Default to enabled for backward compatibility
  return true;
}

export function Widget({ 
  integration, 
  githubConfig,
  position = 'bottom-right',
  language,
  theme,
}: WidgetProps) {
  // Check if widget should be enabled
  if (!isWidgetEnabled()) {
    return null;
  }

  const finalLanguage = language || getDefaultLanguage();
  const finalTheme = theme || getDefaultTheme();
  const t = getTranslations(finalLanguage);
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 md:bottom-8 md:right-8',
    'bottom-left': 'bottom-4 left-4 md:bottom-8 md:left-8',
    'top-right': 'top-4 right-4 md:top-8 md:right-8',
    'top-left': 'top-4 left-4 md:top-8 md:left-4',
  };

  const isTop = position.includes('top');
  const isLeft = position.includes('left');
  
  const panelPositionClass = isTop 
    ? 'absolute top-full mt-2' 
    : 'absolute bottom-full mb-2';
  
  const panelAlignmentClass = isLeft 
    ? 'left-0' 
    : 'right-0';

  return (
    <div 
      data-feedback-widget="true" 
      className={`fixed ${positionClasses[position]} z-50`}
      style={{
        position: 'fixed',
        zIndex: 50,
      }}
    >
      <Popover className="relative">
        <Popover.Panel className={`${panelPositionClass} ${panelAlignmentClass}`}>
          <WidgetForm 
            integration={integration}
            githubConfig={githubConfig}
            language={finalLanguage}
            theme={finalTheme}
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
    </div>
  )
}

