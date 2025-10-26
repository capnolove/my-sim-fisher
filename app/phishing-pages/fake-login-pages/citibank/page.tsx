"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CitibankLoginPage() {
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
          platform: "citibank",
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
      `/phishing-pages/post_education?platform=citibank` +
      `${campaignId ? `&c=${encodeURIComponent(campaignId)}` : ""}` +
      `${employeeId ? `&e=${encodeURIComponent(employeeId)}` : ""}`;

    // Fire-and-forget logging
    const payload = JSON.stringify({
      campaignId,
      employeeId,
      platform: "citibank",
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
    <div className="min-h-screen bg-gradient-to-b from-[#003a70] to-[#002855] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        {/* Citibank Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white px-14 py-7 rounded-lg shadow-lg">
            <img src="/citibank.png" alt="Citibank" className="h-12" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Blue Header */}
          <div className="bg-[#003a70] text-white px-8 py-6">
            <h1 className="text-2xl font-semibold">Sign On</h1>
          </div>

          <div className="p-8">
            {step === "username" ? (
              <div>
                <p className="text-sm text-gray-700 mb-6">
                  Please enter your User ID to continue
                </p>

                <form onSubmit={handleUsernameSubmit}>
                  <div className="mb-6">
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2">
                      User ID
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setShowUsernameError(false);
                      }}
                      className={`w-full px-4 py-3 border-2 ${
                        showUsernameError ? "border-red-500" : "border-gray-300"
                      } rounded focus:outline-none focus:border-[#003a70] text-base text-black`}
                      autoFocus
                      placeholder="User ID"
                    />
                    {showUsernameError && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        Please enter your User ID.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#056dae] text-white py-3 rounded font-semibold text-base hover:bg-[#045a92] transition-colors disabled:opacity-70"
                  >
                    Next
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  <a href="#" className="block text-[#056dae] text-sm hover:underline" onClick={(e) => e.preventDefault()}>
                    Forgot User ID?
                  </a>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 mb-2">Don't have an account?</p>
                    <a href="#" className="text-[#056dae] text-sm font-semibold hover:underline" onClick={(e) => e.preventDefault()}>
                      Register Now
                    </a>
                  </div>
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
                  className="flex items-center mb-6 text-[#056dae] hover:underline"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm font-semibold">Change User ID</span>
                </button>

                <div className="mb-6">
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="text-lg font-semibold text-gray-900">{username}</p>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
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
                      className={`w-full px-4 py-3 border-2 ${
                        showPasswordError ? "border-red-500" : "border-gray-300"
                      } rounded focus:outline-none focus:border-[#003a70] text-base text-black`}
                      autoFocus
                      placeholder="Password"
                    />
                    {showPasswordError && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        Please enter your password.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center mb-6">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 text-[#056dae] border-gray-300 rounded focus:ring-[#056dae]"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                      Remember User ID
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#056dae] text-white py-3 rounded font-semibold text-base hover:bg-[#045a92] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing On..." : "Sign On"}
                  </button>
                </form>

                <div className="mt-6">
                  <a href="#" className="block text-[#056dae] text-sm hover:underline" onClick={(e) => e.preventDefault()}>
                    Forgot Password?
                  </a>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#056dae] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <div className="text-xs text-gray-600">
                  <p className="font-semibold mb-1 text-gray-800">Security Reminder</p>
                  <p>Citi will never ask you to provide your password, PIN, or verification codes via email or phone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white/80 space-x-4">
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Privacy
          </a>
          <span>|</span>
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Terms & Conditions
          </a>
          <span>|</span>
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Security
          </a>
        </div>
      </div>
    </div>
  );
}