import type { AppProps } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans h-screen flex overflow-hidden bg-[#020617] text-slate-200`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#020617]">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
