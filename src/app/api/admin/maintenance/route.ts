import { NextResponse } from "next/server";

// Simple stub endpoint to avoid 404 on admin screens that ping maintenance.
export async function GET() {
  return NextResponse.json({
    success: true,
    maintenance: false,
    message: "Maintenance inactive",
  });
}
