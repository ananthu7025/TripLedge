"use client";

import { Menu, Search, Bell } from "lucide-react";

export function Header() {
    return (
        <header className="h-14 border-b border-border bg-card flex items-center gap-4 px-4 flex-shrink-0">
            <button id="sidebar-toggle"
                className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors lg:hidden">
                <Menu className="h-4 w-4 text-foreground" />
            </button>
            <div className="flex-1 max-w-md">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                        placeholder="Search…"
                        className="pl-9 h-9 w-full rounded-md bg-secondary border-0 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
                <button
                    className="relative h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                    <Bell className="h-4 w-4 text-foreground" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
                </button>
                <div className="flex items-center gap-2 pl-2 border-l border-border mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-primary-foreground">A</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
