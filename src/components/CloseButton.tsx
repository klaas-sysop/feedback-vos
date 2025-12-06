'use client'

import { Popover } from "@headlessui/react";
import { X } from "phosphor-react";

export function CloseButton({ className = "" }: { className?: string }) {
    return (
        <Popover.Button className={`text-zinc-400 hover:text-zinc-100 ${className}`} title="Close feedback form">
            <X weight="bold" className="w-4 h-4"/>
        </Popover.Button>
    )
}

