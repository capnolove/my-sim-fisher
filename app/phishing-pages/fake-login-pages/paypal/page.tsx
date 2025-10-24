"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PayPalLoginPage() {
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
          platform: "paypal",
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
      `/phishing-pages/post_education?platform=paypal` +
      `${campaignId ? `&c=${encodeURIComponent(campaignId)}` : ""}` +
      `${employeeId ? `&e=${encodeURIComponent(employeeId)}` : ""}`;

    // Fire-and-forget logging
    const payload = JSON.stringify({
      campaignId,
      employeeId,
      platform: "paypal",
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
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <div className="w-full max-w-[400px] mt-12">
        {/* PayPal Logo */}
        <div className="flex justify-center mb-8">
          <img src="/paypal.png" alt="PayPal" className="h-8" />
        </div>

        {/* Sign in card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          {step === "email" ? (
            <div>
              <h1 className="text-2xl font-normal text-[#2c2e2f] mb-6">Log in to your PayPal account</h1>

              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setShowEmailError(false);
                    }}
                    placeholder="Email or mobile number"
                    className={`w-full px-3 py-3 border ${
                      showEmailError ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:border-[#0070ba] text-base text-black placeholder-gray-400`}
                    autoFocus
                  />
                  {showEmailError && (
                    <p className="text-red-600 text-sm mt-2">Please enter a valid email address or mobile number.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0070ba] text-white py-3 rounded-full text-base font-medium hover:bg-[#005ea6] transition-colors disabled:opacity-70 mb-4"
                >
                  Next
                </button>
              </form>

              <div className="text-center text-sm">
                <a
                  href="#"
                  className="text-[#0070ba] hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot email or password?
                </a>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6 text-center">
                <p className="text-sm text-[#2c2e2f] mb-3">Don't have an account?</p>
                <button className="w-full border-2 border-[#2c2e2f] text-[#2c2e2f] py-3 rounded-full text-base font-medium hover:bg-gray-50 transition-colors">
                  Sign Up
                </button>
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
                className="flex items-center mb-6 text-[#0070ba] hover:underline"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Back</span>
              </button>

              <div className="mb-6">
                <p className="text-sm text-gray-600">Logging in as</p>
                <p className="text-base font-medium text-[#2c2e2f]">{email}</p>
              </div>

              <h1 className="text-2xl font-normal text-[#2c2e2f] mb-6">Enter your password</h1>

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
                    className={`w-full px-3 py-3 border ${
                      showPasswordError ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:border-[#0070ba] text-base text-black placeholder-gray-400`}
                    autoFocus
                  />
                  {showPasswordError && (
                    <p className="text-red-600 text-sm mt-2">Please enter your password.</p>
                  )}
                </div>

                <div className="text-sm mb-6">
                  <a
                    href="#"
                    className="text-[#0070ba] hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0070ba] text-white py-3 rounded-full text-base font-medium hover:bg-[#005ea6] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-gray-600">
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Contact Us
          </a>
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Privacy
          </a>
          <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
            Legal
          </a>
        </div>
      </div>
    </div>
  );
}