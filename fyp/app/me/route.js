// /app/api/me/route.js
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req) {
  const auth = getAuth(req);
  return NextResponse.json({ userId: auth.userId || null });
}
