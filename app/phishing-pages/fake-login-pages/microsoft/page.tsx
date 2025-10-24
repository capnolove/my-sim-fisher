"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MicrosoftLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("c");
  const employeeId = searchParams.get("e");

  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
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
          platform: "microsoft",
          action: "clicked",
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  }, [campaignId, employeeId]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) {
      setShowEmailError(!email);
      return;
    }
    setShowEmailError(false);
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
      `/phishing-pages/post_education?platform=microsoft` +
      `${campaignId ? `&c=${encodeURIComponent(campaignId)}` : ""}` +
      `${employeeId ? `&e=${encodeURIComponent(employeeId)}` : ""}`;

    // Fire-and-forget logging
    const payload = JSON.stringify({
      campaignId,
      employeeId,
      platform: "microsoft",
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        {/* Microsoft Logo */}
        <div className="flex justify-center mb-6">
          <svg width="108" height="24" viewBox="0 0 108 24" fill="none">
            <rect width="11.45" height="11.45" fill="#F25022"/>
            <rect x="12.55" width="11.45" height="11.45" fill="#7FBA00"/>
            <rect y="12.55" width="11.45" height="11.45" fill="#00A4EF"/>
            <rect x="12.55" y="12.55" width="11.45" height="11.45" fill="#FFB900"/>
            <text x="32" y="18" fill="#5E5E5E" fontFamily="Segoe UI, sans-serif" fontSize="17" fontWeight="600">Microsoft</text>
          </svg>
        </div>

        {/* Sign in card */}
        <div className="bg-white">
          {step === "email" ? (
            <div>
              <h1 className="text-2xl font-semibold text-[#1b1b1b] mb-6">Sign in</h1>

              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setShowEmailError(false);
                    }}
                    placeholder="Email, phone, or Skype"
                    className={`w-full px-3 py-2 border-b-2 ${
                      showEmailError ? "border-[#e81123]" : "border-[#8a8886]"
                    } hover:border-[#000] focus:border-[#0078d4] outline-none text-[15px] text-[#1b1b1b] bg-[#f3f2f1]`}
                    autoFocus
                  />
                  {showEmailError && (
                    <div className="flex items-start mt-2 text-xs text-[#e81123]">
                      <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <span>Enter a valid email address, phone number, or Skype name.</span>
                    </div>
                  )}
                </div>

                <div className="text-[13px] mb-6">
                  <div className="mb-2">
                    <a href="#" className="text-[#0067b8] hover:underline" onClick={(e) => e.preventDefault()}>
                      Can't access your account?
                    </a>
                  </div>
                  <div>
                    <a href="#" className="text-[#0067b8] hover:underline" onClick={(e) => e.preventDefault()}>
                      Sign-in options
                    </a>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#0067b8] text-white px-8 py-2 text-[15px] font-semibold hover:bg-[#005a9e] transition-colors disabled:opacity-70"
                  >
                    Next
                  </button>
                </div>
              </form>

              <div className="mt-6 text-[13px] text-[#1b1b1b]">
                <a href="#" className="text-[#0067b8] hover:underline" onClick={(e) => e.preventDefault()}>
                  Create a Microsoft account
                </a>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setShowPasswordError(false);
                }}
                className="flex items-center mb-6 text-[#0067b8] hover:bg-[#f3f2f1] p-1 -ml-1 rounded"
              >
                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-[13px]">Back</span>
              </button>

              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-[#0067b8] flex items-center justify-center text-white text-sm mr-3">
                  {email.charAt(0).toUpperCase()}
                </div>
                <span className="text-[15px] text-[#1b1b1b]">{email}</span>
              </div>

              <h1 className="text-2xl font-semibold text-[#1b1b1b] mb-6">Enter password</h1>

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setShowPasswordError(false);
                    }}
                    placeholder="Password"
                    className={`w-full px-3 py-2 border-b-2 ${
                      showPasswordError ? "border-[#e81123]" : "border-[#8a8886]"
                    } hover:border-[#000] focus:border-[#0078d4] outline-none text-[15px] text-[#1b1b1b] bg-[#f3f2f1]`}
                    autoFocus
                  />
                  {showPasswordError && (
                    <div className="flex items-start mt-2 text-xs text-[#e81123]">
                      <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <span>Please enter the password for your Microsoft account.</span>
                    </div>
                  )}
                </div>

                <div className="text-[13px] mb-6">
                  <a href="#" className="text-[#0067b8] hover:underline" onClick={(e) => e.preventDefault()}>
                    Forgot password?
                  </a>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#0067b8] text-white px-8 py-2 text-[15px] font-semibold hover:bg-[#005a9e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-8 text-xs text-[#616161]">
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Terms of use
          </a>
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Privacy & cookies
          </a>
          <button className="hover:underline flex items-center" onClick={(e) => e.preventDefault()}>
            ...
          </button>
        </div>
      </div>
    </div>
  );
}