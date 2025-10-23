"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
                <h1 className="text-4xl font-bold text-black mb-2">
                    Welcome to MySimFisher, {user.username}! 👋
                </h1>
                <p className="text-black/70 text-lg">
                    Ready to create your next campaign?
                </p>
            </div>

            {/* Campaign Generation Steps */}
            <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-black mb-6">
                    Create a Campaign in 3 Simple Steps
                </h2>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#620089] text-white rounded-full flex items-center justify-center font-bold text-xl">
                            1
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-black mb-2">
                                👥 Manage Employees
                            </h3>
                            <p className="text-gray-700 mb-3">
                                Add or update your employee list to target the right audience.
                            </p>
                            <Link 
                                href="/dashboard/employees"
                                className="inline-block bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold"
                            >
                                Manage Employees →
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#620089] text-white rounded-full flex items-center justify-center font-bold text-xl">
                            2
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-black mb-2">
                                📧 Create Your Campaign
                            </h3>
                            <p className="text-gray-700 mb-3">
                                Set up your campaign details, choose your audience, and craft your message.
                            </p>
                            <Link 
                                href="/dashboard/mail-create"
                                className="inline-block bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold"
                            >
                                Start Creating →
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#620089] text-white rounded-full flex items-center justify-center font-bold text-xl">
                            3
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-black mb-2">
                                📊 Track Performance
                            </h3>
                            <p className="text-gray-700 mb-3">
                                Monitor your campaign analytics and measure success.
                            </p>
                            <Link 
                                href="/dashboard/analytics"
                                className="inline-block bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold"
                            >
                                View Analytics →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-black mb-6">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-xl text-center">
                        <p className="text-4xl font-bold text-[#620089] mb-2">0</p>
                        <p className="text-sm text-gray-600">Active Campaigns</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl text-center">
                        <p className="text-4xl font-bold text-[#620089] mb-2">0</p>
                        <p className="text-sm text-gray-600">Total Employees</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl text-center">
                        <p className="text-4xl font-bold text-[#620089] mb-2">0%</p>
                        <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
}