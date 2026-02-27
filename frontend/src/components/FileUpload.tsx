"use client";

import { useState, useRef, useCallback } from "react";
import { uploadFile } from "@/lib/api";

interface FileUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onFileUploaded: (file: { name: string; size: string }) => void;
}

export default function FileUpload({ isOpen, onClose, onFileUploaded }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; status: "done" | "error" }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    };

    const handleFile = useCallback(async (file: File) => {
        setUploading(true);
        try {
            await uploadFile(file);
            const entry = { name: file.name, size: formatSize(file.size), status: "done" as const };
            setUploadedFiles((prev) => [...prev, entry]);
            onFileUploaded({ name: file.name, size: formatSize(file.size) });
        } catch {
            setUploadedFiles((prev) => [...prev, { name: file.name, size: formatSize(file.size), status: "error" as const }]);
        } finally {
            setUploading(false);
        }
    }, [onFileUploaded]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        files.forEach((f) => handleFile(f));
    }, [handleFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((f) => handleFile(f));
        e.target.value = "";
    };

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade" onClick={onClose}>
            <div
                className="w-full max-w-lg mx-4 glass-strong rounded-2xl p-6 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--color-text)]">Upload Sources</h3>
                            <p className="text-[11px] text-[var(--color-text-muted)]">PDF, DOCX, TXT, MD, or images</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-[var(--color-surface-light)] flex items-center justify-center tr"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Drop Zone */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.gif"
                    className="hidden"
                    onChange={handleChange}
                    multiple
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`drop-zone flex flex-col items-center justify-center py-12 px-6 cursor-pointer ${dragOver ? "drag-over" : ""}`}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 tr ${dragOver
                        ? "bg-[var(--color-primary-subtle)] scale-110"
                        : "bg-[var(--color-surface)]"
                        }`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "var(--color-primary-light)" : "var(--color-text-muted)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="tr">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        {uploading ? "Uploading..." : "Drop files here or click to browse"}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Supports PDF, DOCX, TXT, MD, PNG, JPG
                    </p>
                </div>

                {/* Uploaded File Chips */}
                {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                        {uploadedFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-fade-in">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={file.status === "error" ? "var(--color-danger)" : "var(--color-primary-light)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[var(--color-text)] truncate">{file.name}</p>
                                    <p className="text-[10px] text-[var(--color-text-muted)]">
                                        {file.status === "error" ? "Upload failed" : file.size}
                                    </p>
                                </div>
                                {file.status === "done" && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    className="w-6 h-6 rounded-md hover:bg-[var(--color-surface-lighter)] flex items-center justify-center tr shrink-0"
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
            </div>
        </div>
    );
}
