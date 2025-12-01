"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DashboardCard({ item, onDelete }) {
  const router = useRouter();

  const {
    id,            // THIS is the dashboard item ID
    materialId,    // THIS is the study material ID
    topic,
    status,
    progress,
    createdAt,
  } = item;

  const progressLabel =
    progress >= 100 ? "Completed" : `${progress || 0}%`;

  const handleContinue = () => {
    router.push(`/materials/${materialId}`);
  };

  const handleDeleteClick = () => {
    if (!window.confirm("Remove this study guide from your dashboard?")) return;
    onDelete(id);   // IMPORTANT: Use dashboardItems.id NOT materialId
  };

  return (
    <div className="relative group rounded-3xl border border-gray-200 bg-white/90 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 via-sky-400 to-emerald-400 opacity-80" />

      <div className="flex flex-col gap-4 p-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Study Guide: {topic}
              </h2>
              <p className="text-xs text-gray-600">
                Topic: <span className="font-semibold">{topic}</span> · Status:{" "}
                <span className="font-semibold capitalize">
                  {status || "completed"}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleDeleteClick}
            className="rounded-full p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span className="font-medium">{progressLabel}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress >= 100
                  ? "bg-emerald-500"
                  : "bg-linear-to-r from-indigo-500 to-sky-400"
              }`}
              style={{ width: `${Math.min(progress || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Material ID: {materialId}</span>
          {createdAt && (
            <span className="hidden sm:inline">
              Added on{" "}
              {new Date(createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-black transition"
          >
            Continue
            <span className="text-xs">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
