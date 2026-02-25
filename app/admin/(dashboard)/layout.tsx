"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ReactNode } from "react";
import { ToastProvider, useToast } from "@/lib/utils/useToast";
import { Toast, ToastContainer } from "@/components/ui/Toast";

function ToastRenderer() {
    const { toasts, dismiss } = useToast();

    return (
        <ToastContainer>
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    variant={toast.variant}
                    onClose={dismiss}
                />
            ))}
        </ToastContainer>
    );
}

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <div className="admin-theme bg-background text-foreground font-sans antialiased flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                        {children}
                    </main>
                </div>
                <ToastRenderer />
            </div>
        </ToastProvider>
    );
}
