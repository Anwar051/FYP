export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { users } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function GET(req) {
  try {
    const { userId: clerkUserId } = getAuth(req) ?? {};
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();

    // ⭐ FIXED LOGIC
    const activeSubscription =
      user.subscriptionTier === "unlimited" ||
      (user.subscriptionTier === "pro" &&
        user.subscriptionExpires &&
        new Date(user.subscriptionExpires) > now);

    return NextResponse.json({
      credits: user.credits ?? 0,
      usedCredits: user.usedCredits ?? 0,
      remaining: (user.credits ?? 0) - (user.usedCredits ?? 0),
      subscriptionTier: user.subscriptionTier,
      subscriptionExpires: user.subscriptionExpires,
      activeSubscription,
    });

  } catch (err) {
    console.error("GET /api/me error", err);
    return NextResponse.json(
      { error: "Server Error", detail: String(err) },
      { status: 500 }
    );
  }
}
