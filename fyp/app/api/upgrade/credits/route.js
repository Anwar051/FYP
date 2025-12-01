export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { users, creditLedger } from "@/configs/schema";
import { eq } from "drizzle-orm";

const CREDIT_PACKS = {
  basic: { credits: 20, label: "Basic Pack" },
  pro: { credits: 50, label: "Pro Pack" },
  ultimate: { credits: 150, label: "Ultimate Pack" },
};

export async function POST(req) {
  try {
    const { userId: clerkUserId } = getAuth(req) ?? {};
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const packId = body.packId;
    const pack = CREDIT_PACKS[packId];

    if (!pack) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add ledger entry
    await db.insert(creditLedger).values({
      userId: user.id,
      requestId: null,
      delta: pack.credits,
      reason: `Credit pack: ${pack.label}`,
    });

    // Increase total credits
    await db
      .update(users)
      .set({ credits: (user.credits ?? 0) + pack.credits })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: `${pack.credits} credits added to your account.`,
    });
  } catch (err) {
    console.error("POST /api/upgrade/credits error", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: String(err) },
      { status: 500 }
    );
  }
}
