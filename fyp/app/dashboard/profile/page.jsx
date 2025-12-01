// app/dashboard/profile/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Mail,
  Calendar,
  BookOpen,
  ClipboardCheck,
  Gauge,
  SunMedium,
  Moon,
  Trash2,
  Settings2,
} from "lucide-react";

const PREFS_KEY = "ai-learn-preferences";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  const [credits, setCredits] = useState(0);
  const [usedCredits, setUsedCredits] = useState(0);
  const [plan, setPlan] = useState("free");
  const [planExpires, setPlanExpires] = useState(null);

  const [totalGuides, setTotalGuides] = useState(0);
  const [completedGuides, setCompletedGuides] = useState(0);
  const [avgProgress, setAvgProgress] = useState(0);

  const [prefs, setPrefs] = useState({
    defaultDifficulty: "Easy",
    defaultPurpose: "exam",
    autosaveNotes: true,
    theme: "light",
  });

  const remainingCredits = credits - usedCredits;

  const PLAN_LABEL =
    plan === "unlimited"
      ? "Unlimited Plan"
      : plan === "pro"
      ? "Pro Plan"
      : "Free Plan";

  const PLAN_BADGE_COLOR =
    plan === "unlimited"
      ? "bg-purple-100 text-purple-800"
      : plan === "pro"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-slate-100 text-slate-700";

  // -------- Load user stats & subscription --------
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;
        const data = await res.json();
        setCredits(data.credits ?? 0);
        setUsedCredits(data.usedCredits ?? 0);
        setPlan(data.subscriptionTier ?? "free");
        setPlanExpires(data.subscriptionExpires ?? null);
      } catch (err) {
        console.error("Failed to load /api/me", err);
      }
    }

    async function loadDashboardStats() {
      try {
        const res = await fetch("/api/dashboard-items");
        if (!res.ok) return;
        const data = await res.json();
        const items = data.items || [];

        setTotalGuides(items.length);

        const completed = items.filter(
          (i) => (i.progress ?? 0) >= 100 || (i.status ?? "") === "completed"
        );
        setCompletedGuides(completed.length);

        if (items.length) {
          const sum = items.reduce(
            (acc, i) => acc + (i.progress ?? 0),
            0
          );
          setAvgProgress(Math.round(sum / items.length));
        } else {
          setAvgProgress(0);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    }

    loadMe();
    loadDashboardStats();
  }, []);

  // -------- Preferences: load from localStorage --------
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFS_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      setPrefs((prev) => ({ ...prev, ...obj }));
    } catch {
      // ignore
    }
  }, []);

  const updatePrefs = (patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // -------- Delete account (Clerk) --------
  const handleDeleteAccount = async () => {
    if (!user) return;
    const ok = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!ok) return;

    try {
      await user.delete();
      // Clerk will sign user out and redirect according to your config
    } catch (err) {
      console.error("Delete account error", err);
      alert("Failed to delete account. Please try again.");
    }
  };

  // -------- Render --------
  const initials =
    user?.firstName?.[0]?.toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
    "A";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* PAGE HEADER */}
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="text-sm text-gray-600">
          Manage your account, subscription, and study preferences.
        </p>
      </header>

      {/* TOP: PROFILE CARD */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {isLoaded && user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Avatar"
              className="h-14 w-14 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gray-900 text-white grid place-items-center text-xl font-semibold">
              {initials}
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.fullName || user?.username || "AI-Learn User"}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-1">
              {user?.primaryEmailAddress?.emailAddress && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.primaryEmailAddress.emailAddress}
                </span>
              )}
              {user?.createdAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right space-y-1">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${PLAN_BADGE_COLOR}`}
          >
            {PLAN_LABEL.toUpperCase()}
          </span>
          {plan === "pro" && planExpires && (
            <p className="text-xs text-gray-500">
              Renews on <span className="font-medium">{formatDate(planExpires)}</span>
            </p>
          )}
          {plan === "free" && (
            <p className="text-xs text-gray-500">
              Free plan ·{" "}
              <span className="font-medium">
                upgrade for unlimited generations
              </span>
            </p>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Total Study Guides
            </span>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalGuides}</p>
          <p className="text-xs text-gray-500">
            Guides you've generated and added to your dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Completed Guides
            </span>
            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {completedGuides}
          </p>
          <p className="text-xs text-gray-500">
            Marked as 100% complete on your dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Average Progress
            </span>
            <Gauge className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {avgProgress}%
          </p>
          <p className="text-xs text-gray-500">
            Across all guides currently on your dashboard.
          </p>
        </div>
      </section>

      {/* PREFERENCES */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Study Preferences
            </h2>
            <p className="text-xs text-gray-500">
              These defaults are used when creating new study materials.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Default Difficulty
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={prefs.defaultDifficulty}
              onChange={(e) =>
                updatePrefs({ defaultDifficulty: e.target.value })
              }
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Default Purpose
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={prefs.defaultPurpose}
              onChange={(e) =>
                updatePrefs({ defaultPurpose: e.target.value })
              }
            >
              <option value="exam">Exam</option>
              <option value="job">Job Interview</option>
              <option value="practice">Practice</option>
              <option value="coding">Coding Prep</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="autosave"
            type="checkbox"
            checked={prefs.autosaveNotes}
            onChange={(e) =>
              updatePrefs({ autosaveNotes: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <label
            htmlFor="autosave"
            className="text-xs text-gray-700 select-none"
          >
            Automatically save chapter notes in this browser.
          </label>
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Danger Zone
        </h2>
        <p className="text-xs text-red-700">
          Deleting your account will remove your AI-Learn profile, study
          materials, and dashboard data. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="inline-flex items-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-600 hover:text-white transition"
        >
          <Trash2 className="h-3 w-3" />
          Delete my account
        </button>
      </section>
    </main>
  );
}
