"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function GoogleLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [loading, setLoading] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("c");
  const employeeId = searchParams.get("e");

  useEffect(() => {
    if (campaignId && employeeId) {
      fetch("/api/phishing/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          employeeId,
          platform: "google",
          action: "clicked",
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error("Failed to log click:", err));
    }
  }, [campaignId, employeeId]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setShowEmailError(false);
      setStep("password");
    } else {
      setShowEmailError(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) {
      setShowPasswordError(!password);
      return;
    }

    setLoading(true);
    setShowPasswordError(false);

    const nextUrl =
      `/phishing-pages/post_education?platform=google` +
      `${campaignId ? `&c=${encodeURIComponent(campaignId)}` : ""}` +
      `${employeeId ? `&e=${encodeURIComponent(employeeId)}` : ""}`;

    try {
      // Fire-and-forget; don’t block navigation
      fetch("/api/phishing/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          employeeId,
          platform: "google",
          action: "submitted",
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch(() => {});
    } finally {
      router.replace(nextUrl); // navigate immediately
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[448px]">
        <div className="border border-[#dadce0] rounded-lg px-10 pt-12 pb-9 bg-white">
          {/* Google Logo */}
          <div className="flex justify-center mb-3">
            <Image 
              src="/google.png" 
              alt="Google" 
              width={125} 
              height={24}
              priority
            />
          </div>

          <h1 className="text-2xl text-center text-[#202124] font-normal mb-3">
            {step === "email" ? "Sign in" : "Welcome"}
          </h1>
          {step === "email" ? (
            <p className="text-base text-center text-[#5f6368] mb-9">
              to continue to Google
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-7">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                {email.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-[#202124]">{email}</span>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-6">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setShowEmailError(false);
                  }}
                  placeholder="Email or phone"
                  className={`w-full px-4 py-3.5 border ${
                    showEmailError ? "border-[#d93025]" : "border-[#dadce0]"
                  } rounded text-base text-[#202124] focus:border-[#1a73e8] focus:border-2 outline-none transition-colors`}
                  autoFocus
                />
                {showEmailError && (
                  <div className="flex items-center mt-2 text-xs text-[#d93025]">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    Enter a valid email or phone number
                  </div>
                )}
              </div>
              <div className="text-sm text-[#1a73e8] mb-6">
                <a href="#" className="font-medium hover:underline" onClick={(e) => e.preventDefault()}>
                  Forgot email?
                </a>
              </div>
              <p className="text-sm text-[#5f6368] mb-8 leading-5">
                Not your computer? Use Guest mode to sign in privately.{" "}
                <a href="#" className="text-[#1a73e8] font-medium hover:underline" onClick={(e) => e.preventDefault()}>
                  Learn more about using Guest mode
                </a>
              </p>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="text-sm text-[#1a73e8] font-medium px-6 py-2 rounded hover:bg-[#f1f3f4] transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Create account
                </button>
                <button
                  type="submit"
                  className="bg-[#1a73e8] text-white text-sm font-medium px-6 py-2.5 rounded hover:bg-[#1765cc] transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 px-4 py-2 border border-[#dadce0] rounded cursor-pointer hover:bg-[#f1f3f4] transition-colors">
                  <span className="text-sm text-[#3c4043]">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setPassword("");
                      setShowPasswordError(false);
                    }}
                    className="text-sm text-[#1a73e8] font-medium ml-4"
                  >
                    ▼
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowPasswordError(false);
                  }}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3.5 border ${
                    showPasswordError ? "border-[#d93025]" : "border-[#dadce0]"
                  } rounded text-base text-[#202124] focus:border-[#1a73e8] focus:border-2 outline-none transition-colors`}
                  autoFocus
                />
                {showPasswordError && (
                  <div className="flex items-center mt-2 text-xs text-[#d93025]">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    Enter a password
                  </div>
                )}
              </div>
              <div className="text-sm text-[#1a73e8] mb-8">
                <a href="#" className="font-medium hover:underline" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="showPassword"
                  className="w-4 h-4 text-[#1a73e8] border-gray-300 rounded focus:ring-[#1a73e8]"
                />
                <label htmlFor="showPassword" className="ml-2 text-sm text-[#5f6368]">
                  Show password
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1a73e8] text-white text-sm font-medium px-6 py-2.5 rounded hover:bg-[#1765cc] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Next"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-[#5f6368]">
          <select className="text-xs text-[#5f6368] bg-transparent border-none outline-none cursor-pointer">
            <option>English (United Kingdom)</option>
            <option>English (United States)</option>
          </select>
        </div>
        <div className="mt-3 flex justify-center gap-6 text-xs text-[#5f6368]">
          <a href="#" className="hover:text-[#202124]" onClick={(e) => e.preventDefault()}>
            Help
          </a>
          <a href="#" className="hover:text-[#202124]" onClick={(e) => e.preventDefault()}>
            Privacy
          </a>
          <a href="#" className="hover:text-[#202124]" onClick={(e) => e.preventDefault()}>
            Terms
          </a>
        </div>
      </div>
    </div>
  );
}