const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Auth Header Helper ──
export function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("debugger_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

// ── Types ──
export interface Citation {
    source: string;
    page: number;
}

export interface StreamResult {
    text: string;
    citations: Citation[];
    conversationId: string | null;
}

// ── Stream Agent ──
export async function streamAgent(
    question: string,
    conversationId: string | null,
    onToken: (partial: StreamResult) => void
): Promise<StreamResult> {
    const body: Record<string, unknown> = { question };
    if (conversationId) body.conversation_id = conversationId;

    const res = await fetch(`${API_BASE}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Agent error: ${res.status}`);
    if (!res.body) throw new Error("No stream body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let fullText = "";
    let citations: Citation[] = [];
    let convId: string | null = conversationId;
    let inSources = false;
    let sourcesBuffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split("\n")) {
            if (line.startsWith("SOURCES:")) {
                inSources = true;
                continue;
            }
            if (line.startsWith("CONVERSATION_ID:")) {
                convId = line.replace("CONVERSATION_ID:", "").trim();
                continue;
            }
            if (inSources) {
                sourcesBuffer += line;
                try {
                    citations = JSON.parse(sourcesBuffer);
                    inSources = false;
                } catch {
                    // keep buffering
                }
                continue;
            }
            fullText += line;
        }

        onToken({ text: fullText, citations, conversationId: convId });
    }

    return { text: fullText, citations, conversationId: convId };
}

// ── Upload File ──
export async function uploadFile(file: File): Promise<{ status: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Upload error: ${res.status}`);
    }
    return res.json();
}

// ── Feedback ──
export async function submitFeedback(
    messageId: number,
    rating: number,
    comment?: string
): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ message_id: messageId, rating, comment }),
    });
    return res.json();
}

// ── Conversations ──
export interface ConversationSummary {
    id: number;
    title: string;
}

export interface ConversationDetail {
    id: number;
    title: string;
    messages: { role: string; content: string }[];
}

export async function getConversations(): Promise<ConversationSummary[]> {
    const res = await fetch(`${API_BASE}/conversations`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) return [];
    return res.json();
}

export async function getConversation(id: number): Promise<ConversationDetail> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch conversation");
    return res.json();
}

export async function renameConversation(id: number, title: string): Promise<any> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
        method: "PATCH",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to rename conversation");
    return res.json();
}

// ── Documents ──
export interface UserDocument {
    id: number;
    filename: string;
    size: number;
    chunks: number;
    date: string;
}

export async function getDocuments(): Promise<UserDocument[]> {
    const res = await fetch(`${API_BASE}/documents`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) return [];
    return res.json();
}

export async function deleteDocument(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete document");
    return res.json();
}

export async function getDocumentChunks(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/${id}/chunks`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch chunks");
    return res.json();
}

export async function reembedDocument(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/${id}/reembed`, {
        method: "POST",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to re-embed document");
    return res.json();
}
