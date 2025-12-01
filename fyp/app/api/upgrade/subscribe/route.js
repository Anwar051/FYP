// app/api/upgrade/subscribe/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { users } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const { userId: clerkUserId } = getAuth(req) ?? {};
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId || !["pro", "unlimited"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid planId" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User record not found" },
        { status: 404 }
      );
    }

    // ---- APPLY SUBSCRIPTION ----
    let updates = {
      subscriptionTier: planId
    };

    if (planId === "pro") {
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);

      updates.subscriptionExpires = expires;
      updates.credits = user.credits + 50; // Bonus
    }

    if (planId === "unlimited") {
      updates.subscriptionExpires = null; // unlimited forever
      updates.credits = 1_000_000;        // infinite feel
    }

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message:
        planId === "pro"
          ? "Successfully subscribed to Pro!"
          : "Unlimited plan activated!"
    });

  } catch (err) {
    console.error("POST /api/upgrade/subscribe error:", err);
    return NextResponse.json(
      { error: "Server Error", detail: String(err) },
      { status: 500 }
    );
  }
}
