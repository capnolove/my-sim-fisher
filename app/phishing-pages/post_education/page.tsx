"use client";

import { useSearchParams } from "next/navigation";
// import Link from "next/link"; // removed
import { useEffect, useState } from "react";
import PhishingQuiz from '@/app/components/PhishingQuiz';

export default function AwarenessPage() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || "unknown";
  const [isVisible, setIsVisible] = useState(false);
  const [showSections, setShowSections] = useState({
    header: false,
    whatHappened: false,
    howToSpot: false,
    whatToDo: false,
    remember: false,
    button: false,
  });

  const platformNames: Record<string, string> = {
    microsoft: "Microsoft",
    google: "Google",
    paypal: "PayPal",
    hsbc: "HSBC",
    citibank: "Citibank",
  };

  useEffect(() => {
    
    setIsVisible(true);

   
    const timers = [
      setTimeout(() => setShowSections(s => ({ ...s, header: true })), 100),
      setTimeout(() => setShowSections(s => ({ ...s, whatHappened: true })), 400),
      setTimeout(() => setShowSections(s => ({ ...s, howToSpot: true })), 700),
      setTimeout(() => setShowSections(s => ({ ...s, whatToDo: true })), 1000),
      setTimeout(() => setShowSections(s => ({ ...s, remember: true })), 1300),
      setTimeout(() => setShowSections(s => ({ ...s, button: true })), 1600),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 overflow-hidden">
      <div 
        className={`max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 transform transition-all duration-700 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Warning Icon with pulse animation */}
        <div className={`text-center mb-6 transform transition-all duration-500 ${
          showSections.header ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div className="inline-block bg-red-100 rounded-full p-4 mb-4 animate-pulse">
            <svg
              className="w-16 h-16 text-red-600 animate-bounce"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-pulse">
            ⚠️ This Was a Phishing Simulation!
          </h1>
          <p className="text-lg text-gray-600">
            You just entered your credentials on a fake {platformNames[platform] || "login"} page.
          </p>
        </div>

        {/* What Happened - Slide in from left */}
        <div className={`bg-red-50 border-l-4 border-red-500 p-6 mb-6 transform transition-all duration-500 delay-100 ${
          showSections.whatHappened ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        }`}>
          <h2 className="text-xl font-semibold text-red-900 mb-3 flex items-center gap-2">
            <span className="animate-pulse">🚨</span>
            What Just Happened?
          </h2>
          <ul className="space-y-2 text-red-800">
            {[
              "You clicked on a link in an email",
              "You entered your email and password on a fake website",
              "In a real attack, criminals would now have access to your account"
            ].map((text, idx) => (
              <li 
                key={idx}
                className={`flex items-start transform transition-all duration-300`}
                style={{ 
                  transitionDelay: `${showSections.whatHappened ? idx * 100 : 0}ms`,
                  opacity: showSections.whatHappened ? 1 : 0,
                  transform: showSections.whatHappened ? 'translateX(0)' : 'translateX(-20px)'
                }}
              >
                <span className="mr-2">❌</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How to Spot Phishing - Slide in from right */}
        <div className={`bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 transform transition-all duration-500 delay-200 ${
          showSections.howToSpot ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}>
          <h2 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span className="animate-pulse">🛡️</span>
            How to Spot Phishing Emails
          </h2>
          <ul className="space-y-3 text-blue-800">
            {[
              { title: "Check the sender's email address", desc: "not just the display name" },
              { title: "Hover over links", desc: "before clicking to see the real URL" },
              { title: "Look for urgency and threats", desc: '"Act now!" "Account suspended!"' },
              { title: "Check for spelling/grammar errors", desc: "often a sign of phishing" },
              { title: "Never enter credentials from an email link", desc: "type the URL yourself" },
              { title: "Enable 2FA", desc: "adds an extra layer of security" },
            ].map((item, idx) => (
              <li 
                key={idx}
                className={`flex items-start transform transition-all duration-300`}
                style={{ 
                  transitionDelay: `${showSections.howToSpot ? idx * 80 : 0}ms`,
                  opacity: showSections.howToSpot ? 1 : 0,
                  transform: showSections.howToSpot ? 'translateX(0)' : 'translateX(20px)'
                }}
              >
                <span className="mr-2">✓</span>
                <div>
                  <strong>{item.title}</strong> - {item.desc}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* What to Do - Fade in with scale */}
        <div className={`bg-green-50 border-l-4 border-green-500 p-6 mb-6 transform transition-all duration-500 delay-300 ${
          showSections.whatToDo ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <h2 className="text-xl font-semibold text-green-900 mb-3 flex items-center gap-2">
            <span className="animate-pulse">✅</span>
            What Should You Do?
          </h2>
          <ol className="space-y-2 text-green-800 list-decimal list-inside">
            {[
              "Report suspicious emails to IT security immediately",
              "Don't click links in unexpected emails",
              "Verify requests through a separate communication channel",
              "Keep software updated to protect against vulnerabilities",
              "Use strong, unique passwords for each account",
            ].map((text, idx) => (
              <li 
                key={idx}
                className={`transform transition-all duration-300`}
                style={{ 
                  transitionDelay: `${showSections.whatToDo ? idx * 100 : 0}ms`,
                  opacity: showSections.whatToDo ? 1 : 0,
                  transform: showSections.whatToDo ? 'translateY(0)' : 'translateY(-10px)'
                }}
              >
                <strong>{text.split(' ')[0]} {text.split(' ')[1]}</strong> {text.split(' ').slice(2).join(' ')}
              </li>
            ))}
          </ol>
        </div>

        {/* Remember - Bounce in */}
        <div className={`bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-6 transform transition-all duration-500 delay-400 ${
          showSections.remember ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
          <p className="text-yellow-900 text-center font-semibold flex items-center justify-center gap-2">
            <span className="text-2xl animate-bounce">💡</span>
            Remember: Legitimate companies will NEVER ask for passwords via email!
          </p>
        </div>

        {/* Test Your Knowledge - Slide up */}
        <div className={`mb-6 transform transition-all duration-500 delay-400 ${
          showSections.remember ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="animate-pulse">📝</span>
            Test Your Knowledge
          </h2>
          <PhishingQuiz />
        </div>

        {/* Action Section - Slide up */}
        <div className={`text-center transform transition-all duration-500 delay-500 ${
          showSections.button ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-sm text-gray-600">
            This was a training exercise. Your data was not compromised.
          </p>
        </div>
      </div>

      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}