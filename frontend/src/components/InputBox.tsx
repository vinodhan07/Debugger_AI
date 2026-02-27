"use client";

import { useState, useRef, useEffect } from "react";
import { uploadFile } from "@/lib/api";

interface InputBoxProps {
    onSend: (text: string) => void;
    disabled?: boolean;
}

interface UploadedFile {
    name: string;
    size: string;
}

export default function InputBox({ onSend, disabled }: InputBoxProps) {
    const [text, setText] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 160) + "px";
        }
    }, [text]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const handleSubmit = () => {
        if (!text.trim() || disabled) return;
        onSend(text.trim());
        setText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    };

    const handleFileUpload = async (file: File) => {
        // Add chip immediately (optimistic)
        setUploadedFiles((prev) => [...prev, { name: file.name, size: formatSize(file.size) }]);

        // Upload in background — don't block the UI
        try {
            await uploadFile(file);
        } catch {
            // Backend may not be running — file is still shown in UI
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((f) => handleFileUpload(f));
        e.target.value = "";
    };

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div>
            {/* ── Uploaded File Chips ── */}
            {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] animate-fade-in">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span className="text-xs text-[var(--color-text)] font-medium truncate max-w-[120px]">{file.name}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">{file.size}</span>
                            <button
                                onClick={() => removeFile(i)}
                                className="w-5 h-5 rounded-full hover:bg-[var(--color-surface-lighter)] flex items-center justify-center tr shrink-0"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Input Bar — full-width pill ── */}
            <div className="glass rounded-full flex items-center gap-2 px-3 py-2 tr input-glow">
                {/* Plus button with pop-up menu */}
                <div className="relative shrink-0" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center tr border ${menuOpen
                            ? "bg-[var(--color-surface-light)] border-[var(--color-border-hover)] text-[var(--color-text)]"
                            : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)]"
                            }`}
                        title="Attach"
                    >
                        <svg
                            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            className={`tr ${menuOpen ? "rotate-45" : ""}`}
                            style={{ transition: "transform 0.2s ease" }}
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>

                    {/* Pop-up menu — slides up */}
                    {menuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-56 glass-strong rounded-2xl border border-[var(--color-border)] shadow-xl shadow-black/30 animate-slide-up overflow-hidden z-50">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.gif"
                                className="hidden"
                                onChange={handleFileChange}
                                multiple
                            />
                            <button
                                onClick={() => {
                                    fileInputRef.current?.click();
                                    setMenuOpen(false);
                                }}
                                disabled={uploading}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] tr"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <span className="font-medium">
                                    {uploading ? "Uploading..." : "Add photos & files"}
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Top ideas to build in AI using no-code tools"
                    disabled={disabled}
                    rows={1}
                    className="flex-1 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] resize-none outline-none text-sm leading-relaxed max-h-40"
                />

                {/* Send — circular with arrow-up */}
                <button
                    onClick={handleSubmit}
                    disabled={disabled || !text.trim()}
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center tr ${text.trim() && !disabled
                        ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] glow-blue-hover cursor-pointer"
                        : "bg-[var(--color-surface)] cursor-not-allowed opacity-40"
                        }`}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
