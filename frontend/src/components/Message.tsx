"use client";

import { useState } from "react";
import { ChatMessage } from "./ChatBox";
import Citation from "./Citation";
import Feedback from "./Feedback";

interface MessageProps {
    message: ChatMessage;
    modelName?: string;
}

export default function Message({ message, modelName = "Llama2" }: MessageProps) {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    // Format current time for display
    const timeStr = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).toLowerCase();

    if (isUser) {
        // ── User Message: Label + timestamp on left, text on right ──
        return (
            <div className="py-4 animate-fade-in">
                <div className="flex gap-3">
                    {/* Left — Label + Timestamp */}
                    <div className="shrink-0 w-[90px] pt-0.5">
                        <p className="text-sm font-semibold text-[var(--color-primary)]">User</p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">at, {timeStr}</p>
                    </div>
                    {/* Right — Message content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed text-[var(--color-text)]">
                            {message.content}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── AI Message: Mixtral label + response time, content below ──
    return (
        <div className="py-4 animate-fade-in group">
            <div className="flex gap-3">
                {/* Left — Model name + response time */}
                <div className="shrink-0 w-[90px] pt-0.5">
                    <p className="text-sm font-semibold text-[var(--color-primary)]">{modelName}</p>
                    {!message.isStreaming && message.responseTime && (
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                            response time: {message.responseTime.toFixed(1)}s
                        </p>
                    )}
                    {message.isStreaming && (
                        <p className="text-[11px] text-[var(--color-text-muted)]">typing...</p>
                    )}
                </div>

                {/* Right — Content */}
                <div className="flex-1 min-w-0">
                    {/* Message text */}
                    <div className="text-sm leading-7 text-[var(--color-text-secondary)]">
                        {message.content || (
                            <span className="flex gap-1.5 items-center h-6">
                                <span className="streaming-dot" />
                                <span className="streaming-dot" />
                                <span className="streaming-dot" />
                            </span>
                        )}
                        {message.isStreaming && message.content && (
                            <span className="inline-block ml-1 w-2 h-5 bg-[var(--color-primary)] animate-pulse rounded-sm align-text-bottom" />
                        )}
                    </div>

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {message.citations.map((c, i) => (
                                <Citation key={i} source={c.source} page={c.page} />
                            ))}
                        </div>
                    )}

                    {/* Action buttons — Copy / Rewrite / Edit — bordered ghost pills */}
                    {!message.isStreaming && message.content && (
                        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 tr">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface)] tr"
                            >
                                {copied ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                )}
                                {copied ? "Copied" : "Copy"}
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface)] tr">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 4 23 10 17 10" />
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                </svg>
                                Rewrite
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface)] tr">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                            </button>

                            {/* Feedback inline */}
                            <div className="ml-auto">
                                <Feedback messageId={message.id} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
