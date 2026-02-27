"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

interface SettingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedModel: string;
    onSelectModel: (model: string) => void;
    onClearHistory: () => void;
}

export default function SettingsDrawer({
    isOpen,
    onClose,
    selectedModel,
    onSelectModel,
    onClearHistory,
}: SettingsDrawerProps) {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

    // Initialize theme from localStorage or system
    useEffect(() => {
        const savedTheme = localStorage.getItem("debugger_theme") as "dark" | "light" | "system";
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    const applyTheme = (t: "dark" | "light" | "system") => {
        const root = document.documentElement;
        if (t === "system") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.toggle("dark", isDark);
            localStorage.removeItem("debugger_theme");
        } else {
            root.classList.toggle("dark", t === "dark");
            localStorage.setItem("debugger_theme", t);
        }
    };

    const handleThemeChange = (t: "dark" | "light" | "system") => {
        setTheme(t);
        applyTheme(t);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-[320px] h-full bg-[var(--color-bg-body)] border-l border-[var(--color-border)] shadow-2xl animate-slide-left flex flex-col">
                {/* Header */}
                <div className="h-[52px] flex items-center justify-between px-4 border-b border-[var(--color-border)]">
                    <span className="text-sm font-semibold text-[var(--color-text)]">Settings</span>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-[var(--color-surface-light)] flex items-center justify-center tr"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Account */}
                    <section className="space-y-3">
                        <h3 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Account</h3>
                        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                {user?.name?.[0].toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.name || "User"}</p>
                                <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-medium hover:bg-red-500/10 tr"
                        >
                            Sign out
                        </button>
                    </section>

                    {/* Preferences */}
                    <section className="space-y-3">
                        <h3 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Preferences</h3>

                        {/* Theme */}
                        <div className="space-y-2">
                            <label className="text-[11px] text-[var(--color-text-secondary)]">Color Theme</label>
                            <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                                {(["light", "dark", "system"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => handleThemeChange(t)}
                                        className={`py-1.5 text-[10px] font-medium capitalize rounded-md tr ${theme === t
                                            ? "bg-[var(--color-bg-body)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]"
                                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                            <label className="text-[11px] text-[var(--color-text-secondary)]">Default Model</label>
                            <div className="space-y-1">
                                {(["Llama2", "Llama3", "Mistral", "Gemma"]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => onSelectModel(m)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs tr border ${selectedModel === m
                                            ? "bg-[var(--color-primary-subtle)] border-[var(--color-primary)]/20 text-[var(--color-primary-light)] font-medium"
                                            : "bg-transparent border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                                            }`}
                                    >
                                        {m}
                                        {selectedModel === m && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Data Control</h3>
                        <button
                            onClick={onClearHistory}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--color-border)] hover:bg-red-500/5 hover:border-red-500/20 hover:text-red-400 text-xs text-[var(--color-text-secondary)] tr group"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 0 1-2.001 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Clear chat history
                        </button>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-text-dim)] text-center">Debuggers AI v1.0.0 • Premium Edition</p>
                </div>
            </div>
        </div>
    );
}
