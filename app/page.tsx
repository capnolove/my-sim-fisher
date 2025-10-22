import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-5 bg-[#620089]">
      <div className="flex h-10 shrink-0 items-end rounded-lg bg-[#D8AAEA] px-15 py-6 md:h-20 font-instrument-sans text-[18px] font-semibold text-black">
        <p>MySimFisher</p>
        <div className="ml-2 p-0">
          <Image src="/logo.png" alt="Logo" width={34} height={34} className="rounded-sm" />
        </div>
        <div className="flex items-center gap-10 ml-auto">
          <button className="px-3 py-1 text-sm font-instrument-sans text-[18px] font-semibold text-black rounded-md bg-white hover:bg-[#C8C8C8]">
            Sign up
          </button>
          <button className="px-3 py-1 text-sm font-instrument-sans text-[18px] font-semibold text-black rounded-md bg-white hover:bg-[#C8C8C8]">
            Login
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-row w-full bg-transparent">
        <div className="flex flex-1 flex-col mt-6 h-1/2 w-1/3 shrink-0 items-center justify-center rounded-lg bg-[#D8AAEA] md:h-20 font-instrument-sans font-semibold text-black">
          <p className="m-0 justify-center p-4 text-left text-[26px] text-[#583535]">Start building your “last line of defense” today</p>
          <p className="m-0 justify-center p-4 text-left text-[18px] text-[#583535]">Launching hyper-realistic phishing campaigns to form your “last line of defense”. Get started to begin a new security training program for your corporation</p>
            <button className="px-6 py-3 text-lg font-instrument-sans text-[18px] font-semibold text-black rounded-md bg-white hover:bg-[#C8C8C8] min-w-[240px]">
            Get started now
            </button>
        </div>
        <div className="w-full md:w-1/3 mt-6 md:mt-0 h-1/2 ml-auto relative rounded-lg bg-transparent">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
      </div>
    </main>
  );
}
