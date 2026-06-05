import type { Metadata } from "next";
import { Space_Grotesk, Rubik_Mono_One } from "next/font/google";
import "./globals.css";
import "@/styles/animations.css";
import Header from "@/components/layout/Header";
import ParticleBackground from "@/components/layout/ParticleBackground";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const rubikMonoOne = Rubik_Mono_One({
  subsets: ["latin"],
  variable: "--font-rubik-mono-one",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Brainrot Marble Mayhem - Enterprise Edition",
  description: "Enterprise grade seedable brainrot marble race simulator. Spin widgets, collect items, evade traps!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${rubikMonoOne.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[#0a0a0f] text-[#f0f0ff] relative">
        <ParticleBackground />
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 w-full max-w-7xl mx-auto z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
