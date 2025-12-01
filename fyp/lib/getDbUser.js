import { db } from "@/configs/db";
import { users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs";

export async function getOrCreateDbUser() {
  const { userId } = auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const found = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (found.length) return found[0];

  const cu = await currentUser();
  const primaryEmail = cu?.emailAddresses?.[0]?.emailAddress;
  if (!primaryEmail) throw new Error("NO_EMAIL_ON_CLERK_PROFILE");

  const name =
    cu?.firstName && cu?.lastName ? `${cu.firstName} ${cu.lastName}` :
    cu?.firstName || cu?.username || primaryEmail.split("@")[0];

  const [inserted] = await db
    .insert(users)
    .values({ name, email: primaryEmail, clerkId: userId })
    .returning({ id: users.id, name: users.name, email: users.email, clerkId: users.clerkId });

  return inserted;
}
