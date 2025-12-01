export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { users, dashboardItems } from "@/configs/schema";
import { eq, and } from "drizzle-orm";

// =========================
// PATCH → Update progress
// =========================
export async function PATCH(req, ctx) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);

    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const progress = Number(body?.progress);

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    const { userId: clerkUserId } = getAuth(req) ?? {};
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update only if item belongs to user
    const [updated] = await db
      .update(dashboardItems)
      .set({ progress })
      .where(
        and(
          eq(dashboardItems.id, idNum),
          eq(dashboardItems.userId, userRow.id)
        )
      )
      .returning({
        id: dashboardItems.id,
        progress: dashboardItems.progress,
      });

    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: String(err) },
      { status: 500 }
    );
  }
}

// =========================
// DELETE → remove dashboard item
// =========================
export async function DELETE(req, ctx) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);

    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { userId: clerkUserId } = getAuth(req) ?? {};
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete only if owned by user
    const deleted = await db
      .delete(dashboardItems)
      .where(
        and(
          eq(dashboardItems.id, idNum),
          eq(dashboardItems.userId, userRow.id)
        )
      )
      .returning({ id: dashboardItems.id });

    if (!deleted.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deletedId: deleted[0].id,
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: String(err) },
      { status: 500 }
    );
  }
}
