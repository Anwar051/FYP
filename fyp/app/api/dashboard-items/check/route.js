import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { dashboardItems, users } from "@/configs/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const materialId = Number(searchParams.get("materialId"));

  if (!Number.isFinite(materialId)) {
    return NextResponse.json({ error: "Invalid materialId" }, { status: 400 });
  }

  const { userId } = getAuth(req) ?? {};
  if (!userId) return NextResponse.json({ added: false });

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!user) return NextResponse.json({ added: false });

  const existing = await db
    .select()
    .from(dashboardItems)
    .where(
      and(
        eq(dashboardItems.userId, user.id),
        eq(dashboardItems.materialId, materialId)
      )
    )
    .limit(1);

  return NextResponse.json({ added: existing.length > 0 });
}
