"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // ✅ SHOW RATE LIMIT ERROR
                if (response.status === 429) {
                    setError(`🔒 Account locked. Try again in ${data.remainingTime} seconds.`);
                } else {
                    // Show attempts remaining
                    setError(
                        `${data.error}${
                            data.attemptsRemaining !== undefined
                                ? ` (${data.attemptsRemaining} attempts remaining)`
                                : ""
                        }`
                    );
                }
                return;
            }

            // Success
            localStorage.setItem("token", data.user.id);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-5 bg-[#620089]">
            <div className="w-full max-w-md bg-[#D8AAEA] rounded-lg shadow-lg p-8">
                <Link href="/" className="text-[#620089] hover:underline mb-4 inline-block">
                    ← Back to Home
                </Link>

                <div className="flex items-center justify-center gap-3 mb-6">
                    <h1 className="text-3xl font-semibold text-center text-black">MySimFisher</h1>
                    <Image 
                        src="/logo.png" 
                        alt="MySimFisher Logo" 
                        width={40} 
                        height={40}
                        className="object-contain rounded-md"
                    />   
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#620089] text-black font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#620089] text-black font-medium"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#620089] text-white py-2 px-4 rounded-md hover:bg-[#4a0068] transition-colors disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-[#620089] hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}