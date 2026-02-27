"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import ChatBox, { ChatMessage } from "@/components/ChatBox";
import LoginPage from "@/components/LoginPage";
import SettingsDrawer from "@/components/SettingsDrawer";
import { getConversation, renameConversation } from "@/lib/api";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Llama2");
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Fetch messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      getConversation(Number(conversationId))
        .then((detail) => {
          const formatted: ChatMessage[] = detail.messages.map((m: { role: string; content: string }, i: number) => ({
            id: i,
            role: m.role as "user" | "assistant",
            content: m.content
          }));
          setMessages(formatted);
        })
        .catch(() => { });
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-body)]">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center glow-blue animate-pulse">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginPage />;
  }

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${conversationId || "new"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    setMessages([]);
    setSettingsOpen(false);
  };

  const handleRenameChat = async () => {
    if (!conversationId || !editedTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await renameConversation(Number(conversationId), editedTitle.trim());
      setIsEditingTitle(false);
      setSidebarRefreshKey(prev => prev + 1);
    } catch {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-body)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          key={sidebarRefreshKey}
          activeConversationId={conversationId}
          onSelectConversation={setConversationId}
          onNewChat={handleNewChat}
          onClose={() => setSidebarOpen(false)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-main)] relative">
        {/* ── Top Navbar ── */}
        <header className="h-[52px] border-b border-[var(--color-border)] flex items-center px-4 shrink-0 z-10">
          {/* Left */}
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-8 h-8 rounded-lg hover:bg-[var(--color-surface-light)] flex items-center justify-center tr"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}

            {/* Model Selector Pill */}
            <div className="relative" ref={modelMenuRef}>
              <button
                onClick={() => setModelSelectorOpen(!modelSelectorOpen)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border tr cursor-pointer ${modelSelectorOpen
                  ? "bg-[var(--color-surface-hover)] border-[var(--color-primary)]/40 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)]"
                  }`}
              >
                <span className="text-xs font-semibold text-[var(--color-text)]">{selectedModel}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" className={`tr ${modelSelectorOpen ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Model Dropdown */}
              {modelSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 glass rounded-xl border border-[var(--color-border)] shadow-xl animate-scale-in p-1 z-50">
                  {(["Llama2", "Llama3", "Mistral", "Gemma"]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setSelectedModel(m); setModelSelectorOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs tr ${selectedModel === m
                        ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary-light)] font-medium"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                        }`}
                    >
                      {m}
                      {selectedModel === m && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)] shadow-[0_0_6px_var(--color-primary-light)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right — Actions */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 animate-scale-in">
                <input
                  autoFocus
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameChat();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  onBlur={handleRenameChat}
                  className="bg-[var(--color-surface)] border border-[var(--color-primary)]/40 rounded-lg px-3 py-1 text-xs text-[var(--color-text)] outline-none min-w-[200px] shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                />
              </div>
            ) : (
              <button
                onClick={handleExport}
                disabled={messages.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface-light)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] tr disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Export chat
              </button>
            )}

            <button
              onClick={() => setSettingsOpen(true)}
              className="w-8 h-8 rounded-lg hover:bg-[var(--color-surface-light)] flex items-center justify-center tr"
              title="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsEditingTitle(true);
                setEditedTitle(""); // Or fetch current title if desired, but empty is usually fine to start
              }}
              disabled={!conversationId}
              className="w-8 h-8 rounded-lg hover:bg-[var(--color-surface-light)] flex items-center justify-center tr disabled:opacity-30"
              title="Edit Title"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatBox
            messages={messages}
            setMessages={setMessages}
            isLoading={isAgentLoading}
            setIsLoading={setIsAgentLoading}
            selectedModel={selectedModel}
            conversationId={conversationId}
            onConversationCreated={setConversationId}
          />
        </div>

        {/* Settings Drawer */}
        <SettingsDrawer
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onClearHistory={handleClearHistory}
        />
      </main>
    </div>
  );
}
