"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    googleLogin: (credential: string) => Promise<boolean>;
    register: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    login: async () => false,
    googleLogin: async () => false,
    register: async () => false,
    logout: () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("debugger_user");
        const savedToken = localStorage.getItem("debugger_token");
        if (savedUser && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
                setToken(savedToken);
            } catch {
                localStorage.removeItem("debugger_user");
                localStorage.removeItem("debugger_token");
            }
        }
        setIsLoading(false);
    }, []);

    const handleLoginSuccess = (jwt: string, email: string) => {
        const newUser: User = {
            name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            email,
        };
        setUser(newUser);
        setToken(jwt);
        localStorage.setItem("debugger_user", JSON.stringify(newUser));
        localStorage.setItem("debugger_token", jwt);
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const res = await fetch(`${API_BASE}/auth/token`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
            });

            if (!res.ok) return false;

            const data = await res.json();
            handleLoginSuccess(data.access_token, email);
            return true;
        } catch {
            return false;
        }
    };

    const googleLogin = async (credential: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: credential }),
            });

            if (!res.ok) return false;

            const data = await res.json();
            // In a real app, we'd decode the JWT to get the email, 
            // but for now we'll just handle success
            handleLoginSuccess(data.access_token, "Google User");
            return true;
        } catch {
            return false;
        }
    };

    const register = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/auth/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
                method: "POST",
            });
            if (res.ok) {
                return await login(email, password);
            }
        } catch { }
        return false;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("debugger_user");
        localStorage.removeItem("debugger_token");
        // Clear session history explicitly for "fresh" login
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, googleLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
