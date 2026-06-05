import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaderboardPostSchema } from "@/types/api";

/**
 * GET handler: returns the list of last 20 completed races, formatted for leaderboard display.
 */
export async function GET() {
  try {
    const races = await prisma.race.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        entries: {
          orderBy: { position: "asc" }
        }
      }
    });

    const formatted = races.map((race) => {
      const winnerEntry = race.entries.find((e) => e.position === 1);
      return {
        id: race.id,
        createdAt: race.createdAt.toISOString(),
        winner: winnerEntry?.marbleName || "Unknown",
        winnerTime: race.duration,
        participants: race.entries.length,
        chaosMode: race.chaosMode,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST handler: saves a completed race along with its participant entries.
 * Validates request payload against Zod schema rules.
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    
    // Validate request structure
    const result = LeaderboardPostSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { seed, duration, chaosMode, entries } = result.data;

    // Create database records
    const newRace = await prisma.race.create({
      data: {
        seed,
        duration,
        chaosMode,
        entries: {
          create: entries.map((entry) => ({
            marbleName: entry.marbleName,
            imageUrl: entry.imageUrl,
            finishTime: entry.finishTime,
            position: entry.position,
            powerupsCollected: entry.powerupsCollected,
            debuffsHit: entry.debuffsHit,
            isBot: entry.isBot,
          })),
        },
      },
      include: {
        entries: true,
      },
    });

    return NextResponse.json({ success: true, data: newRace });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
