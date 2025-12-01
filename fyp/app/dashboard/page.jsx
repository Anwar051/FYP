"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/components/DashboardCard";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "alpha", label: "A → Z" },
  { id: "progress", label: "Progress" },
];

export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/dashboard-items");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed with status ${res.status}`);
        }

        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // -----------------------------
  // DELETE DASHBOARD ITEM
  // -----------------------------
  const handleDelete = async (dashboardItemId) => {
    try {
      const res = await fetch(`/api/dashboard-items/${dashboardItemId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Delete failed");
      }

      setItems((prev) => prev.filter((i) => i.id !== dashboardItemId));
    } catch (err) {
      alert("ERROR: " + err.message);
    }
  };

  // -----------------------------
  // SORT + FILTER
  // -----------------------------
  const filteredSortedItems = useMemo(() => {
    let list = [...items];

    if (filterStatus !== "all") {
      list = list.filter(
        (i) => (i.status || "completed") === filterStatus
      );
    }

    switch (sortBy) {
      case "oldest":
        list.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "alpha":
        list.sort((a, b) =>
          (a.topic || "").localeCompare(b.topic || "")
        );
        break;
      case "progress":
        list.sort((a, b) => (a.progress || 0) - (b.progress || 0));
        break;
      case "newest":
      default:
        list.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
    }

    return list;
  }, [items, sortBy, filterStatus]);

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Your Study Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            All the study guides you added from the generator, in one place.
          </p>
        </header>

        {/* Controls */}
        <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {items.length} guides
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In progress</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <p className="text-gray-600">Loading dashboard…</p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : filteredSortedItems.length === 0 ? (
          <p className="text-gray-600 text-sm">
            You have no study guides yet.
          </p>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {filteredSortedItems.map((item) => (
              <DashboardCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
