'use client'

import { Popover } from "@headlessui/react";
import { X } from "phosphor-react";

export function CloseButton({ className = "", title = "Close feedback form" }: { className?: string; title?: string }) {
    return (
        <Popover.Button className={`text-zinc-400 hover:text-zinc-100 ${className}`} title={title}>
            <X weight="bold" className="w-4 h-4"/>
        </Popover.Button>
    )
}

