"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function Home() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) redirect("/dashboard");
  }, [isSignedIn]);

  if (isSignedIn) return null; // will redirect instantly

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Welcome</h1>

        <Link href="/sign-in">
          <Button>Sign in</Button>
        </Link>
      </div>
    </main>
  );
}
