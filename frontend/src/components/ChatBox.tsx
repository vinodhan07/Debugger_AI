"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { streamAgent, Citation as CitationType, StreamResult } from "@/lib/api";
import Message from "./Message";
import InputBox from "./InputBox";

export interface ChatMessage {
    id: number;
    role: "user" | "assistant";
    content: string;
    citations?: CitationType[];
    isStreaming?: boolean;
    responseTime?: number;
}

interface ChatBoxProps {
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    selectedModel: string;
    conversationId: string | null;
    onConversationCreated: (id: string) => void;
}

const SUGGESTIONS = [
    { label: "Debug an error" },
    { label: "Analyze a document" },
    { label: "Explain a concept" },
    { label: "Write some code" },
];

export default function ChatBox({
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    selectedModel,
    conversationId,
    onConversationCreated
}: ChatBoxProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const msgIdRef = useRef(messages.length);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSend = async (question: string) => {
        if (!question.trim() || isLoading) return;

        const userMsgId = ++msgIdRef.current;
        const assistantMsgId = ++msgIdRef.current;
        const startTime = Date.now();

        setMessages((prev) => [
            ...prev,
            { id: userMsgId, role: "user", content: question },
            { id: assistantMsgId, role: "assistant", content: "", isStreaming: true },
        ]);
        setIsLoading(true);

        try {
            let bufferResult: StreamResult | null = null;
            let animationFrameId: number | null = null;

            const updateMessages = (partial: StreamResult) => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMsgId
                            ? { ...m, content: partial.text, citations: partial.citations, isStreaming: true }
                            : m
                    )
                );
            };

            const result: StreamResult = await streamAgent(
                question,
                conversationId,
                (partial) => {
                    bufferResult = partial;
                    if (animationFrameId === null) {
                        animationFrameId = requestAnimationFrame(() => {
                            if (bufferResult) updateMessages(bufferResult);
                            animationFrameId = null;
                        });
                    }
                    if (partial.conversationId && !conversationId) {
                        onConversationCreated(partial.conversationId);
                    }
                }
            );

            if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);

            const elapsed = ((Date.now() - startTime) / 1000);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMsgId
                        ? { ...m, content: result.text, citations: result.citations, isStreaming: false, responseTime: elapsed }
                        : m
                )
            );
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMsgId
                        ? { ...m, content: "⚠️ Failed to get response. Please try again.", isStreaming: false }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                <div className="max-w-[900px] mx-auto px-4 py-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[55vh] animate-fade-in">
                            {/* Hero Icon */}
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center mb-6 glow-blue">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
                                What can I help with?
                            </h1>
                            <p className="text-sm text-[var(--color-text-muted)] mb-10">
                                Debug code, analyze documents, or ask anything.
                            </p>

                            {/* Suggestion chips */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s.label)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-full glass glass-hover tr text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
                                    >
                                        <span>{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        {messages.map((msg) => (
                            <Message key={msg.id} message={msg} modelName={selectedModel} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Input */}
            <div className="shrink-0 px-5 pb-5 pt-2">
                <div className="max-w-[900px] mx-auto">
                    <InputBox onSend={handleSend} disabled={isLoading} />
                    <p className="text-[10px] text-[var(--color-text-dim)] text-center mt-2.5">
                        Debuggers AI may produce inaccurate information. Verify important facts.
                    </p>
                </div>
            </div>
        </div>
    );
}
