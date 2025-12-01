"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Rocket, User2, Plus } from "lucide-react";

const NavItem = ({ href, label, icon: Icon, exact = false }) => {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition",
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-gray-100",
      ].join(" ")}
    >
      <Icon className={active ? "h-4 w-4 text-white" : "h-4 w-4 text-slate-500"} />
      {label}
    </Link>
  );
};

export default function Sidebar() {
  const [credits, setCredits] = useState(0);
  const [used, setUsed] = useState(0);
  const [plan, setPlan] = useState("free"); // ⭐ NEW

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;

        const data = await res.json();

        setCredits(data.credits);
        setUsed(data.usedCredits);
        setPlan(data.subscriptionTier ?? "free"); // ⭐ NEW
      } catch (err) {
        console.error("Failed to load user data", err);
      }
    }

    loadUser();
  }, []);

  const remaining = credits - used;
  const percent = credits > 0 ? (used / credits) * 100 : 0;

  // ⭐ DISPLAY NAME IMPROVED
  const PLAN_NAME =
    plan === "unlimited"
      ? "Unlimited Plan"
      : plan === "pro"
      ? "Pro Plan"
      : "Free Plan";

  return (
    <aside className="sticky top-0 h-screen w-[260px] shrink-0 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* brand */}
        <div className="px-4 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-900 text-white font-semibold">
              A
            </div>
            <span className="text-lg font-semibold text-slate-800">AI-Learn</span>
          </div>
        </div>

        {/* Create button */}
        <div className="px-4 pt-3 pb-5">
          <Link
            href="/create"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black/90"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-2 px-4">
          <NavItem href="/dashboard" label="Dashboard" icon={Grid} exact />
          <NavItem href="/dashboard/upgrade" label="Upgrade" icon={Rocket} />
          <NavItem href="/dashboard/profile" label="Profile" icon={User2} />
        </nav>

        {/* subscription + credits */}
        <div className="mt-auto px-4 pb-6 pt-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {/* ⭐ SHOW REAL SUBSCRIPTION TIER */}
            <p className="text-xs font-semibold text-gray-500 mb-1">
              {PLAN_NAME}
            </p>

            <p className="text-sm font-medium text-slate-700 mb-1">
              Available Credits:
              <span className="font-semibold"> {remaining}</span>
            </p>

            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {used} out of {credits} credits used
            </p>

            <Link
              href="/dashboard/upgrade"
              className="mt-1 inline-block text-xs font-medium text-gray-900 underline underline-offset-4"
            >
              Upgrade to create more
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
