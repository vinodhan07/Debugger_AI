"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Stats {
    users: number;
    documents: number;
    conversations: number;
}

export default function AdminPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
                    headers: getAuthHeaders()
                });

                if (response.status === 403) {
                    setError("Insufficient permissions. Admin access only.");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch admin statistics");
                }

                const data = await response.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#12151A] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#12151A] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Admin Governance
                    </h1>
                    <p className="text-gray-400 mt-2">Platform-wide analytics and control center.</p>
                </header>

                {error ? (
                    <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl text-red-400 flex flex-col items-center">
                        <span className="text-lg mb-4">⚠️ {error}</span>
                        <button
                            onClick={() => router.push("/")}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Return to Chat
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Stat Card 1 */}
                        <div className="bg-[#1E2128] border border-[#2D3139] p-6 rounded-2xl">
                            <div className="text-gray-400 text-sm font-medium mb-1">Total Users</div>
                            <div className="text-4xl font-bold text-white">{stats?.users}</div>
                            <div className="mt-4 text-xs text-blue-400 font-mono uppercase tracking-wider">Registered Accounts</div>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="bg-[#1E2128] border border-[#2D3139] p-6 rounded-2xl">
                            <div className="text-gray-400 text-sm font-medium mb-1">Documents</div>
                            <div className="text-4xl font-bold text-white">{stats?.documents}</div>
                            <div className="mt-4 text-xs text-purple-400 font-mono uppercase tracking-wider">Active Vector Index</div>
                        </div>

                        {/* Stat Card 3 */}
                        <div className="bg-[#1E2128] border border-[#2D3139] p-6 rounded-2xl">
                            <div className="text-gray-400 text-sm font-medium mb-1">Conversations</div>
                            <div className="text-4xl font-bold text-white">{stats?.conversations}</div>
                            <div className="mt-4 text-xs text-emerald-400 font-mono uppercase tracking-wider">Total Trace History</div>
                        </div>
                    </div>
                )}

                <div className="mt-12 bg-[#16191F] border border-[#2D3139] p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg opacity-50 cursor-not-allowed">
                            Export Logs (Coming Soon)
                        </button>
                        <button
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/metrics`}
                            className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all"
                        >
                            Open Raw Metrics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
