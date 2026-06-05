import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NeonText } from "@/components/ui/NeonText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Ensure page updates dynamically on database submissions
export const dynamic = "force-dynamic";

/**
 * Server Component representing the global records board.
 * Queries SQLite directly and renders high-performance SSR tables.
 */
export default async function LeaderboardPage() {
  const races = await prisma.race.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      entries: {
        orderBy: { position: "asc" }
      }
    }
  });

  return (
    <div className="w-full flex flex-col items-center py-6 select-none">
      <div className="text-center mb-8">
        <NeonText as="h2" color="purple" glitch className="text-3xl md:text-4xl font-black mb-2">
          GLOBAL RECORDS
        </NeonText>
        <p className="text-[#6b6b8a] text-xs uppercase font-bold tracking-widest">
          historical summary lists of completed simulation races
        </p>
      </div>

      <Card glowColor="purple" className="w-full max-w-3xl border-[#bf5fff]/25 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-black text-[#6b6b8a] uppercase tracking-widest">
                <th className="pb-3.5">DATE</th>
                <th className="pb-3.5">WINNER</th>
                <th className="pb-3.5">WIN TIME</th>
                <th className="pb-3.5">RUNNERS</th>
                <th className="pb-3.5">MODE</th>
                <th className="pb-3.5 text-right">SEED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {races.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/35 font-bold uppercase tracking-widest">
                    NO RECORDED RUNS YET
                  </td>
                </tr>
              ) : (
                races.map((race) => {
                  const winnerEntry = race.entries.find(e => e.position === 1);
                  const dateStr = new Date(race.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <tr key={race.id} className="hover:bg-white/5 transition-all duration-200">
                      <td className="py-3 font-mono text-white/50">{dateStr}</td>
                      <td className="py-3 font-black text-[#00f5ff]">{winnerEntry?.marbleName || "Unknown"}</td>
                      <td className="py-3 font-mono font-bold text-[#ffe600]">{race.duration.toFixed(2)}s</td>
                      <td className="py-3 font-mono text-white/70">{race.entries.length}</td>
                      <td className="py-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                          race.chaosMode 
                            ? "bg-red-500/10 text-red-400 border-red-500/20" 
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}>
                          {race.chaosMode ? "CHAOS 🔥" : "NORMAL"}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-[#bf5fff]">{race.seed}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8">
        <Link href="/lobby">
          <Button variant="neon" neonColor="purple" size="lg" className="px-10 py-3 text-sm font-black select-none">
            LOBBY SETUP 🔄
          </Button>
        </Link>
      </div>
    </div>
  );
}
