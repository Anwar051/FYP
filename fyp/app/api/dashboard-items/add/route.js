export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { dashboardItems, studyMaterials, users } from "@/configs/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req) {
  try {
    const { userId: clerkUserId } = getAuth(req) ?? {};

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { materialId } = body;

    if (!materialId || isNaN(materialId)) {
      return NextResponse.json(
        { error: "Invalid materialId" },
        { status: 400 }
      );
    }

    // Get real user row
    const [usr] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId));

    if (!usr) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Make sure material exists
    const [mat] = await db
      .select()
      .from(studyMaterials)
      .where(eq(studyMaterials.id, Number(materialId)));

    if (!mat) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Prevent duplicates
    const existing = await db
      .select()
      .from(dashboardItems)
      .where(
        and(
          eq(dashboardItems.userId, usr.id),
          eq(dashboardItems.materialId, Number(materialId))
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Already added" },
        { status: 409 }
      );
    }

    // Insert new dashboard item
    const inserted = await db
      .insert(dashboardItems)
      .values({
        userId: usr.id,
        materialId: Number(materialId),
        progress: 0,
        requestId: mat.requestId ?? null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      dashboardItem: inserted[0],
    });
  } catch (err) {
    console.error("ADD DASHBOARD ERROR:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
