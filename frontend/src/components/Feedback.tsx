"use client";

import { useState } from "react";
import { submitFeedback } from "@/lib/api";

interface FeedbackProps {
    messageId: number;
}

export default function Feedback({ messageId }: FeedbackProps) {
    const [selected, setSelected] = useState<"up" | "down" | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleFeedback = async (rating: "up" | "down") => {
        if (submitted) return;
        setSelected(rating);
        setSubmitted(true);
        try {
            await submitFeedback(messageId, rating === "up" ? 1 : -1);
        } catch { /* non-critical */ }
    };

    return (
        <div className="flex items-center gap-0.5">
            <button
                onClick={() => handleFeedback("up")}
                disabled={submitted}
                className={`ghost-btn p-1.5 rounded-lg ${selected === "up"
                    ? "text-[var(--color-success)] bg-[rgba(16,185,129,0.1)]"
                    : ""
                    }`}
                title="Good response"
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={selected === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
            </button>
            <button
                onClick={() => handleFeedback("down")}
                disabled={submitted}
                className={`ghost-btn p-1.5 rounded-lg ${selected === "down"
                    ? "text-[var(--color-danger)] bg-[rgba(239,68,68,0.1)]"
                    : ""
                    }`}
                title="Bad response"
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={selected === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
            </button>
        </div>
    );
}
