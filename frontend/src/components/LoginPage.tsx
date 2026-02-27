"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
    const { login, register, googleLogin } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        let success: boolean;

        if (isRegister) {
            success = await register(email, password);
            if (!success) setError("Registration failed. Email may already exist.");
        } else {
            success = await login(email, password);
            if (!success) setError("Invalid credentials. Please try again.");
        }
        setLoading(false);
    };

    const handleGoogleSuccess = async (response: any) => {
        setLoading(true);
        const success = await googleLogin(response.credential);
        if (!success) setError("Google sign-in failed. Please try again.");
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-body)] px-4">
            <div className="w-full max-w-sm animate-fade-in">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <img src="/logo.png" alt="Debuggers AI" className="w-12 h-12 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--color-text-secondary)]">
                        {isRegister ? "Create account" : "Welcome back"}
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1.5 font-medium">
                        {isRegister ? "Start your journey with Debuggers AI" : "Continue your AI-assisted development"}
                    </p>
                </div>

                {/* Google OAuth Section */}
                <div className="mb-6">
                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google Sign-In was cancelled.")}
                            theme="filled_black"
                            shape="pill"
                            width="100%"
                            text="continue_with"
                        />
                    </div>

                    <div className="relative mt-8 mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--color-border)]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[var(--color-bg-body)] px-3 text-[var(--color-text-muted)] tracking-widest font-semibold">Or with email</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-fade-in font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] tr"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)]">Password</label>
                            {!isRegister && <button type="button" className="text-[10px] font-bold text-[var(--color-primary-light)] hover:opacity-80">Forgot?</button>}
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] tr"
                            autoComplete={isRegister ? "new-password" : "current-password"}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white text-sm font-bold tracking-wide tr glow-blue-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="20" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            isRegister ? "Start Building Free" : "Sign In to Dashboard"
                        )}
                    </button>
                </form>

                <p className="text-xs text-[var(--color-text-secondary)] text-center mt-8 font-medium">
                    {isRegister ? "Already a member?" : "New to Project Phoenix?"}{" "}
                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(""); }}
                        className="text-[var(--color-primary-light)] hover:text-[var(--color-primary)] font-bold cursor-pointer transition-colors"
                    >
                        {isRegister ? "Back to Login" : "Create Enterprise Account"}
                    </button>
                </p>
            </div>
        </div>
    );
}
