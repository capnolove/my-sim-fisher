"use client";

import { useState } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "What should you do first when receiving a suspicious email?",
    options: [
      "Check the sender's email address",
      "Click any links to investigate",
      "Reply to ask if it's legitimate",
      "Forward it to colleagues"
    ],
    correctAnswer: 0,
    explanation: "Always verify the sender's email address first, as phishers often use display names that look legitimate."
  },
  {
    id: 2,
    question: "How can you safely verify a suspicious request?",
    options: [
      "Reply to the email directly",
      "Click the link to check",
      "Contact the company through a separate, known channel",
      "Enter your credentials to verify"
    ],
    correctAnswer: 2,
    explanation: "Always verify requests through a separate, known communication channel - never use the contact details provided in the suspicious email."
  },
  {
    id: 3,
    question: "What is a sign of a phishing email?",
    options: [
      "Professional company logo",
      "Urgent deadline to act",
      "Personalized greeting",
      "Clear contact information"
    ],
    correctAnswer: 1,
    explanation: "Creating urgency is a common phishing tactic to make you act without thinking."
  },
  {
    id: 4,
    question: "Which email domain is more likely to be a phishing attempt?",
    options: [
      "support@paypal.com",
      "paypal-support@secure-mail.net",
      "help@paypal.com",
      "service@paypal.com"
    ],
    correctAnswer: 1,
    explanation: "Legitimate companies typically send emails from their official domain. Be suspicious of emails from generic or similar-looking domains."
  },
  {
    id: 5,
    question: "What should you do if you accidentally clicked a suspicious link?",
    options: [
      "Ignore it and hope nothing happens",
      "Keep it to yourself to avoid embarrassment",
      "Immediately report it to IT security",
      "Wait to see if problems occur"
    ],
    correctAnswer: 2,
    explanation: "Always report security incidents immediately to your IT team. Quick reporting can help prevent or minimize damage."
  },
  {
    id: 6,
    question: "Which password is most secure?",
    options: [
      "Password123!",
      "MyBirthday1990",
      "P@ssw0rd",
      "kM9$pL2#vN5@jR"
    ],
    correctAnswer: 3,
    explanation: "Strong passwords use a mix of uppercase, lowercase, numbers, and special characters in a random order."
  },
  {
    id: 7,
    question: "What is a common sign of a phishing email requesting payment?",
    options: [
      "Includes company letterhead",
      "Has unusual payment methods",
      "Contains invoice numbers",
      "Uses formal language"
    ],
    correctAnswer: 1,
    explanation: "Phishers often request payments through unusual methods like wire transfers, gift cards, or cryptocurrency."
  },
  {
    id: 8,
    question: "Which email subject line is most likely to be phishing?",
    options: [
      "Team meeting at 3 PM",
      "Your account will be terminated in 24 hours",
      "Weekly project update",
      "New office policy document"
    ],
    correctAnswer: 1,
    explanation: "Phishing emails often create urgency with threats about account termination or immediate action required."
  },
  {
    id: 9,
    question: "What should you check in the 'From' address of an email?",
    options: [
      "Only the display name",
      "The company logo",
      "The actual email address domain",
      "The subject line"
    ],
    correctAnswer: 2,
    explanation: "Always check the actual email domain address, not just the display name, as phishers can easily fake display names."
  },
  {
    id: 10,
    question: "What information should you never provide via email?",
    options: [
      "Your job title",
      "Meeting availability",
      "Password or security codes",
      "Project deadlines"
    ],
    correctAnswer: 2,
    explanation: "Never share passwords, security codes, or other sensitive credentials via email, even if the request seems legitimate."
  }
];

export default function PhishingQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (selectedOption: number) => {
    setSelectedAnswer(selectedOption);
    setShowExplanation(true);
    
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  return (
    <div className="bg-[#D8AAEA] rounded-lg p-6 shadow-lg">
      {showResult ? (
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-4 text-[#620089]">Quiz Complete! 🎉</h2>
          <p className="text-center text-lg mb-4 text-[#620089]">
            You scored {score} out of {questions.length}
          </p>
          <div className="text-center">
            <button
              onClick={resetQuiz}
              className="bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-[#620089]">
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-full bg-[#620089] rounded transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4 text-[#620089]">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-3 text-left rounded-lg transition-colors text-[#620089] ${
                  selectedAnswer === null
                    ? 'hover:bg-white/50 bg-white/30 border border-[#620089]'
                    : selectedAnswer === index
                    ? index === questions[currentQuestion].correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : 'bg-red-100 border-red-500 text-red-800'
                    : index === questions[currentQuestion].correctAnswer
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-white/30 border border-[#620089]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-[#620089] font-medium">
                {questions[currentQuestion].explanation}
              </p>
              <button
                onClick={nextQuestion}
                className="mt-4 bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors"
              >
                {currentQuestion + 1 < questions.length ? "Next Question" : "Show Results"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}