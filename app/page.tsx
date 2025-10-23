"use client"

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-5 bg-[#620089]">
      <div className="flex h-10 shrink-0 items-end rounded-lg bg-[#D8AAEA] px-15 py-5 md:h-20 font-sans font-semibold text-[20px] text-black antialiased">
        <p>MySimFisher</p>
        <div className="ml-2 p-0">
          <Image src="/logo.png" alt="Logo" width={34} height={34} className="rounded-sm" />
        </div>
        <div className="flex items-center gap-10 ml-auto">
          <button className="px-3 py-1 text-sm font-sans text-[18px] text-black rounded-md font-semibold bg-white hover:bg-[#C8C8C8]">
            <Link href="/signup">Sign Up</Link>
          </button>
          <button className="px-3 py-1 text-sm font-sans text-[18px] text-black rounded-md font-semibold bg-white hover:bg-[#C8C8C8]">
            <Link href="/login">Login</Link>
          </button>
        </div>
      </div>
      <div className="flex flex-row gap-[260px] mt-6 w-full">
        <div className="flex flex-col w-1/3 h-[70vh] shrink-0 items-center justify-center rounded-lg bg-[#D8AAEA] px-6 py-6 font-sans font-semibold text-black">
          <p className="m-0 justify-center p-4 text-left text-[36px] text-[#583535]">Start building your “last line of defense” today</p>
          <p className="m-0 justify-center p-4 text-left text-[24px] text-[#583535]">Launching hyper-realistic phishing campaigns to form your “last line of defense”. Get started to begin a new security training program for your corporation</p>
            <button className="mt-12 px-6 py-3 text-lg font-instrument-sans text-[18px] font-semibold text-black rounded-md bg-white hover:bg-[#C8C8C8] min-w-[240px]">
              <Link href="/signup">Get started now</Link>
            </button>
        </div>
        <div className="flex flex-col w-1/4 h-[70vh] shrink-0 items-center justify-center bg-transparent relative">
          <div className="relative w-[350px] h-[350px] rounded-lg overflow-hidden">
            <Image src="/phishing-meme.png" alt="Logo" fill className="object-cover object-center"/>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-3 w-full items-center justify-center font-semibold font-sans">
        <p className="m-0 justify-center p-10 text-center text-[24px] text-white max-w-2xl">©2025 MySimFisher. No rights reserved.</p>
      </div>
    </main>
  );
}
