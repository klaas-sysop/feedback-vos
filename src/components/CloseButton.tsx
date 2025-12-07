'use client'

import { Popover } from "@headlessui/react";
import { X } from "phosphor-react";
import { Theme } from "../types";
import { getThemeClasses } from "../lib/theme";

export function CloseButton({ className = "", title = "Close feedback form", theme = 'dark' }: { className?: string; title?: string; theme?: Theme }) {
    const themeClasses = getThemeClasses(theme);
    return (
        <Popover.Button className={`${themeClasses.textTertiary} ${theme === 'dark' ? 'hover:text-zinc-100' : 'hover:text-gray-900'} ${className}`} title={title}>
            <X weight="bold" className="w-4 h-4"/>
        </Popover.Button>
    )
}

