"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        router.push("/login");
        return;
      }
      const parsed = JSON.parse(raw);
      setUser(parsed);
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-[#620089] p-4 flex flex-col">
      {/* Top Header with rounded corners */}
      <header className="bg-[#D8AAEA] rounded-lg shadow-lg px-14 py-5 mb-4 flex h-10 md:h-20 items-end justify-between">
        {/* Keep logo/brand in header */}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-sans text-black text-[20px]">
          <span>MySimFisher</span>
          <Image
            src="/logo.png"
            alt="MySimFisher"
            width={34}
            height={34}
            className="rounded-sm"
          />
        </Link>

        {/* Moved user + logout to header, removed date/time */}
        <div className="flex items-center gap-3 ">
          <div className="px-3 py-1 bg-white/70 rounded-lg text-sm font-sans text-black">
            Logged in as <strong>{user.username}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-sans text-sm font-semibold"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Content row: side nav below header */}
      <div className="flex flex-1 gap-4">
        {/* Side Navigation - #D8AAEA (brand removed) */}
        <aside className="w-64 bg-[#D8AAEA] text-black rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {/* Nav */}
          <nav className="flex-1 p-3 space-y-2 text-sm">
            <Link
              href="/dashboard/adm_dashboard"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/adm_dashboard")
                  ? "bg-white/80 text-black font-semibold"
                  : "text-black/80 hover:bg-white/60"
              }`}
            >
              🏠 Dashboard
            </Link>
            <Link
              href="/dashboard/analytics"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/analytics")
                  ? "bg-white/80 text-black font-semibold"
                  : "text-black/80 hover:bg-white/60"
              }`}
            >
              📊 Analytics
            </Link>
            <Link
              href="/dashboard/employees"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/employees")
                  ? "bg-white/80 text-black font-semibold"
                  : "text-black/80 hover:bg-white/60"
              }`}
            >
              👥 Employees
            </Link>
            <Link
              href="/dashboard/mail-create"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/mail-create")
                  ? "bg-white/80 text-black font-semibold"
                  : "text-black/80 hover:bg-white/60"
              }`}
            >
              📧 Campaigns
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}