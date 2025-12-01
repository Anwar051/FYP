"use client";

import { Laptop } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function Welcome() {
  const { user } = useUser();
  const first = user?.firstName ?? "there";

  return (
    <section className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4">
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
        <Laptop className="h-6 w-6 text-gray-600" />
      </div>

      {/* Text */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Hello, {first}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, it’s time to get back and start learning a new course.
        </p>
      </div>
    </section>
  );
}
