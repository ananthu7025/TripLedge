"use client";

import * as React from "react";
import { cn } from "@/app/utils/utils";
import { Badge } from "./Badge";

interface TabItem {
    label: string;
    value: string;
    count?: number;
}

interface TabsProps {
    tabs: TabItem[];
    activeValue: string;
    onChange: (value: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeValue, onChange, className }: TabsProps) {
    return (
        <div className={cn(
            "inline-flex items-center rounded-full bg-slate-200/50 p-1 w-fit min-w-max flex-shrink-0 border border-slate-200/50",
            className
        )}>
            <div className="flex items-center gap-1 flex-nowrap">
                {tabs.map((tab) => (
                    <TabButton
                        key={tab.value}
                        label={tab.label}
                        count={tab.count}
                        active={activeValue === tab.value}
                        onClick={() => onChange(tab.value)}
                    />
                ))}
            </div>
        </div>
    );
}

interface TabButtonProps {
    label: string;
    count?: number;
    active?: boolean;
    onClick?: () => void;
}

function TabButton({ label, active = false, onClick }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-all duration-200",
                active
                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            )}
        >
            <span>{label}</span>
        </button>
    );
}
