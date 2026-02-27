"use client";

import { useState, useEffect } from "react";
import {
    getConversations,
    getDocuments,
    deleteDocument,
    getDocumentChunks,
    reembedDocument,
    ConversationSummary,
    UserDocument
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onClose: () => void;
    onOpenSettings: () => void;
}

export default function Sidebar({
    activeConversationId,
    onSelectConversation,
    onNewChat,
    onClose,
    onOpenSettings,
}: SidebarProps) {
    const { user, logout } = useAuth();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{ filename: string, chunks: any[] } | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [activeTab, setActiveTab] = useState<"history" | "files">("history");

    useEffect(() => {
        getConversations()
            .then(setConversations)
            .catch(() => { });
    }, [activeConversationId]);

    useEffect(() => {
        if (activeTab === "files") {
            getDocuments()
                .then(setDocuments)
                .catch(() => { });
        }
    }, [activeTab]);

    const filtered = conversations.filter((c) =>
        (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this document? This will remove it from RAG context.")) return;
        try {
            await deleteDocument(id);
            const docs = await getDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePreview = async (id: number) => {
        setIsLoadingPreview(true);
        try {
            const data = await getDocumentChunks(id);
            setPreviewDoc(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleReembed = async (id: number) => {
        try {
            await reembedDocument(id);
            alert("Re-embedding triggered successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="w-[260px] bg-[var(--color-sidebar)] border-r border-[var(--color-border)] flex flex-col shrink-0">
            {/* ── Logo + Close ── */}
            <div className="h-[52px] flex items-center justify-between px-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src="/logo.png" alt="Debuggers AI" className="w-7 h-7 object-contain" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-text)]">Debuggers AI</span>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg hover:bg-[var(--color-surface-light)] flex items-center justify-center tr"
                    title="Close sidebar"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            </div>

            {/* ── Search ── */}
            <div className="px-3 pt-3 pb-2">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search chat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-surface)] rounded-full pl-9 pr-3 py-2 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none border border-[var(--color-border)] focus:border-[var(--color-border-hover)] tr"
                    />
                </div>
            </div>

            {/* ── Create Chat ── */}
            <div className="px-3 pb-3">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-sm font-semibold tr cursor-pointer"
                >
                    Create chat
                </button>
            </div>

            {/* ── Tabs: History / My Files ── */}
            <div className="px-3 pb-2 flex gap-1">
                <button
                    onClick={() => setActiveTab("history")}
                    className={`flex-1 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-lg tr cursor-pointer ${activeTab === "history"
                        ? "text-[var(--color-primary-light)] bg-[var(--color-primary-subtle)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                        }`}
                >
                    History
                </button>
                <button
                    onClick={() => setActiveTab("files")}
                    className={`flex-1 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-lg tr cursor-pointer ${activeTab === "files"
                        ? "text-[var(--color-primary-light)] bg-[var(--color-primary-subtle)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                        }`}
                >
                    My Files
                </button>
            </div>

            {/* ── Tab Content ── */}
            <div className="flex-1 overflow-y-auto px-2">
                {activeTab === "history" ? (
                    /* ── Chat History ── */
                    filtered.length === 0 ? (
                        <p className="text-xs text-[var(--color-text-muted)] text-center py-8 px-2">
                            {searchQuery ? "No results found." : "No conversations yet."}
                        </p>
                    ) : (
                        <div className="space-y-0.5">
                            {filtered.map((conv) => {
                                const isActive = String(conv.id) === activeConversationId;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => onSelectConversation(String(conv.id))}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 tr group relative ${isActive
                                            ? "bg-[var(--color-primary-subtle)]"
                                            : "hover:bg-[var(--color-surface)]"
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-primary)]" />
                                        )}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "var(--color-primary-light)" : "var(--color-text-muted)"} strokeWidth="2" strokeLinecap="round" className="shrink-0">
                                            <line x1="4" y1="6" x2="20" y2="6" />
                                            <line x1="4" y1="12" x2="20" y2="12" />
                                            <line x1="4" y1="18" x2="20" y2="18" />
                                        </svg>
                                        <span className={`text-sm truncate ${isActive
                                            ? "text-[var(--color-primary-light)] font-medium"
                                            : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]"
                                            }`}>
                                            {conv.title || "Untitled"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )
                ) : (
                    /* ── My Files ── */
                    documents.length === 0 ? (
                        <div className="text-center py-8 px-2">
                            <svg className="mx-auto mb-2 opacity-30" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <p className="text-xs text-[var(--color-text-muted)]">No files uploaded yet.</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Upload PDF, TXT, CSV, MD, or DOCX</p>
                        </div>
                    ) : (
                        <div className="space-y-1 px-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="w-full px-3 py-3 rounded-xl bg-[var(--color-surface-light)]/40 border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface)] tr group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-subtle)] flex items-center justify-center shrink-0">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-[var(--color-text)] truncate">
                                                {doc.filename}
                                            </p>
                                            <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-2">
                                                <span>{formatSize(doc.size)}</span>
                                                <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                                                <span>{doc.chunks} {doc.chunks === 1 ? "chunk" : "chunks"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 tr">
                                        <button
                                            onClick={() => handlePreview(doc.id)}
                                            className="grow flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-[var(--color-surface-lighter)] hover:bg-[var(--color-primary)]/10 text-[10px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] tr"
                                        >
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleReembed(doc.id)}
                                            className="w-8 h-6 flex items-center justify-center rounded-md bg-[var(--color-surface-lighter)] hover:bg-[var(--color-warning)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-warning)] tr"
                                            title="Re-embed"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 2v6h-6" />
                                                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                                                <path d="M3 22v-6h6" />
                                                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="w-8 h-6 flex items-center justify-center rounded-md bg-[var(--color-surface-lighter)] hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 tr"
                                            title="Delete"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* ── User Profile ── */}
            <div className="border-t border-[var(--color-border)] p-3 relative">
                <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--color-surface)] tr group"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.25)]">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.name || "User"}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user?.email || ""}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" className="shrink-0 opacity-0 group-hover:opacity-100 tr">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                    </svg>
                </button>

                {/* Profile dropdown */}
                {showProfileMenu && (
                    <div className="absolute bottom-full left-3 right-3 mb-2 glass rounded-xl border border-[var(--color-border)] shadow-xl shadow-black/30 animate-slide-up overflow-hidden z-50">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] tr">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Profile
                        </button>
                        <button
                            onClick={() => { setShowProfileMenu(false); onOpenSettings(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] tr"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15V14a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06" />
                            </svg>
                            Settings
                        </button>
                        <div className="border-t border-[var(--color-border)]" />
                        <button
                            onClick={() => { setShowProfileMenu(false); logout(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 tr"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log out
                        </button>
                    </div>
                )}
            </div>

            {/* ── Preview Modal ── */}
            {previewDoc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop animate-fade">
                    <div className="w-full max-w-2xl bg-[var(--color-bg-body)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col max-h-[80vh] animate-slide-up">
                        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--color-text)]">{previewDoc.filename}</h3>
                                <p className="text-[10px] text-[var(--color-text-muted)]">{previewDoc.chunks.length} total segments</p>
                            </div>
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="w-8 h-8 rounded-lg hover:bg-[var(--color-surface-hover)] flex items-center justify-center tr"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
                                    <path d="M18 6L6 18" />
                                    <path d="M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {previewDoc.chunks.map((chunk, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[9px] font-bold text-[var(--color-primary-light)] tracking-wider uppercase">Segment #{chunk.index + 1}</span>
                                        <div className="h-px grow bg-[var(--color-border)]/50" />
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--color-surface-light)]/50 border border-[var(--color-border)]/50 text-xs text-[var(--color-text-secondary)] leading-relaxed group-hover:bg-[var(--color-surface)] tr">
                                        {chunk.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
