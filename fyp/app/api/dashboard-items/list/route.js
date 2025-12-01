export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { users, dashboardItems, studyMaterials } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function GET(req) {
  const { userId: clerkUserId } = getAuth(req) ?? {};
  if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [u] = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Join materials
  const items = await db
    .select({
      id: dashboardItems.id,
      progress: dashboardItems.progress,
      createdAt: dashboardItems.createdAt,
      requestId: dashboardItems.requestId,
      materialId: dashboardItems.materialId,
      topic: studyMaterials.topic,
      difficultyLevel: studyMaterials.difficultyLevel,
    })
    .from(dashboardItems)
    .leftJoin(studyMaterials, eq(dashboardItems.materialId, studyMaterials.id))
    .where(eq(dashboardItems.userId, u.id));

  return NextResponse.json({ items });
}
