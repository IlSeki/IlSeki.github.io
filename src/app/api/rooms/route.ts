import { NextResponse } from "next/server";

/**
 * GET handler: Returns active room counts (scaffold placeholder).
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Multiplayer room API is scaffolded. Ready for Socket.io real-time extension.",
    rooms: [],
  });
}

/**
 * POST handler: Creates a mock multiplayer room (scaffold placeholder).
 */
export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Room created successfully (scaffold).",
    roomId: `room_${Math.random().toString(36).substring(2, 9)}`,
  });
}
