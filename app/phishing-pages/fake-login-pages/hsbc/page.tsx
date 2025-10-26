"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HSBCLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("c");
  const employeeId = searchParams.get("e");

  const [step, setStep] = useState<"username" | "password">("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showUsernameError, setShowUsernameError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Log "clicked" on mount
  useEffect(() => {
    if (campaignId && employeeId) {
      fetch("/api/phishing/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          employeeId,
          platform: "hsbc",
          action: "clicked",
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  }, [campaignId, employeeId]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || loading) {
      setShowUsernameError(!username);
      return;
    }
    setShowUsernameError(false);
    setStep("password");
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
      `/phishing-pages/post_education?platform=hsbc` +
      `${campaignId ? `&c=${encodeURIComponent(campaignId)}` : ""}` +
      `${employeeId ? `&e=${encodeURIComponent(employeeId)}` : ""}`;

    // Fire-and-forget logging
    const payload = JSON.stringify({
      campaignId,
      employeeId,
      platform: "hsbc",
      action: "submitted",
      timestamp: new Date().toISOString(),
    });

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon("/api/phishing/log", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/phishing/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }

    router.replace(nextUrl);
  };

  return (
    <div className="min-h-screen bg-[#db0011] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* HSBC Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white px-12 py-6 rounded">
            <img src="/hsbc.png" alt="HSBC" className="h-10" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === "username" ? (
            <div>
              <h1 className="text-2xl font-bold text-[#333333] mb-2">Log on</h1>
              <p className="text-sm text-gray-600 mb-6">to HSBC Personal Internet Banking</p>

              <form onSubmit={handleUsernameSubmit}>
                <div className="mb-6">
                  <label htmlFor="username" className="block text-sm font-medium text-[#333333] mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setShowUsernameError(false);
                    }}
                    className={`w-full px-4 py-3 border ${
                      showUsernameError ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:border-[#db0011] text-base text-black`}
                    autoFocus
                  />
                  {showUsernameError && (
                    <p className="text-red-600 text-sm mt-2">Please enter your username.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#db0011] text-white py-3 rounded font-semibold text-base hover:bg-[#b00010] transition-colors disabled:opacity-70"
                >
                  Continue
                </button>
              </form>

              <div className="mt-6 space-y-3 text-sm">
                <a href="#" className="block text-[#db0011] hover:underline" onClick={(e) => e.preventDefault()}>
                  Forgot your username?
                </a>
                <a href="#" className="block text-[#db0011] hover:underline" onClick={(e) => e.preventDefault()}>
                  Register for Internet Banking
                </a>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setStep("username");
                  setPassword("");
                  setShowPasswordError(false);
                }}
                className="flex items-center mb-6 text-[#db0011] hover:underline"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm">Back</span>
              </button>

              <h1 className="text-2xl font-bold text-[#333333] mb-2">Enter your password</h1>
              <p className="text-sm text-gray-600 mb-2">for</p>
              <p className="text-base font-semibold text-[#333333] mb-6">{username}</p>

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-[#333333] mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setShowPasswordError(false);
                    }}
                    className={`w-full px-4 py-3 border ${
                      showPasswordError ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:border-[#db0011] text-base text-black`}
                    autoFocus
                  />
                  {showPasswordError && (
                    <p className="text-red-600 text-sm mt-2">Please enter your password.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#db0011] text-white py-3 rounded font-semibold text-base hover:bg-[#b00010] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging on..." : "Log on"}
                </button>
              </form>

              <div className="mt-6 text-sm">
                <a href="#" className="block text-[#db0011] hover:underline" onClick={(e) => e.preventDefault()}>
                  Forgot your password?
                </a>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#db0011] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div className="text-xs text-gray-600">
                <p className="font-semibold mb-1">Security information</p>
                <p>We'll never ask you for your password in an email, text message or phone call.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white">
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Privacy and Security
          </a>
          {" | "}
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Terms & Conditions
          </a>
        </div>
      </div>
    </div>
  );
}