"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function Provider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const inFlightRef = useRef(false);

  useEffect(() => {
    // Wait until Clerk is fully loaded & the user is signed in
    if (!isLoaded || !isSignedIn || !user) return;

    // Deduplicate: only send once per user id (even across reloads)
    const key = `userCreateSent:${user.id}`;
    if (inFlightRef.current || localStorage.getItem(key) === "1") return;

    inFlightRef.current = true;

    fetch("/api/user-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.fullName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        clerkId: user.id,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        localStorage.setItem(key, "1");
      })
      .catch((err) => {
        console.error("❌ Failed to send user.create:", err);
        // allow retry on the next render
        inFlightRef.current = false;
      });
  }, [isLoaded, isSignedIn, user?.id]);

  return <>{children}</>;
}
