interface CitationProps {
    source: string;
    page: number;
}

export default function Citation({ source, page }: CitationProps) {
    return (
        <button className="ghost-btn glass glass-hover rounded-xl px-3 py-1.5 cursor-default group">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 tr group-hover:drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="font-medium text-xs text-[var(--color-text-secondary)] truncate max-w-[140px]">{source}</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">p.{page}</span>
        </button>
    );
}
