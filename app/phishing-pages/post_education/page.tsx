"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AwarenessPage() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || "unknown";

  const platformNames: Record<string, string> = {
    microsoft: "Microsoft",
    google: "Google",
    paypal: "PayPal",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Warning Icon */}
        <div className="text-center mb-6">
          <div className="inline-block bg-red-100 rounded-full p-4 mb-4">
            <svg
              className="w-16 h-16 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚠️ This Was a Phishing Simulation!
          </h1>
          <p className="text-lg text-gray-600">
            You just entered your credentials on a fake {platformNames[platform] || "login"} page.
          </p>
        </div>

        {/* What Happened */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-900 mb-3">
            What Just Happened?
          </h2>
          <ul className="space-y-2 text-red-800">
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span>You clicked on a link in an email</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span>You entered your email and password on a fake website</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span>In a real attack, criminals would now have access to your account</span>
            </li>
          </ul>
        </div>

        {/* How to Spot Phishing */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            🛡️ How to Spot Phishing Emails
          </h2>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <div>
                <strong>Check the sender's email address</strong> - not just the display name
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <div>
                <strong>Hover over links</strong> before clicking to see the real URL
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <div>
                <strong>Look for urgency and threats</strong> - "Act now!" "Account suspended!"
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <div>
                <strong>Check for spelling/grammar errors</strong> - often a sign of phishing
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <div>
                <strong>Never enter credentials from an email link</strong> - type the URL yourself
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <div>
                <strong>Enable 2FA</strong> - adds an extra layer of security
              </div>
            </li>
          </ul>
        </div>

        {/* What to Do */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-900 mb-3">
            ✅ What Should You Do?
          </h2>
          <ol className="space-y-2 text-green-800 list-decimal list-inside">
            <li><strong>Report suspicious emails</strong> to IT security immediately</li>
            <li><strong>Don't click links</strong> in unexpected emails</li>
            <li><strong>Verify requests</strong> through a separate communication channel</li>
            <li><strong>Keep software updated</strong> to protect against vulnerabilities</li>
            <li><strong>Use strong, unique passwords</strong> for each account</li>
          </ol>
        </div>

        {/* Remember */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-6">
          <p className="text-yellow-900 text-center font-semibold">
            💡 Remember: Legitimate companies will NEVER ask for passwords via email!
          </p>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            This was a training exercise. Your data was not compromised.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            I Understand - Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}