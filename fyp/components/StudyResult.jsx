"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, StickyNote, Sparkles } from "lucide-react";

export default function StudyResult({ id, mode = "view" }) {
  const router = useRouter();

  const [material, setMaterial] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [openChapters, setOpenChapters] = useState({});
  const [notes, setNotes] = useState({});
  const [completed, setCompleted] = useState({});
  const [dashboardItemId, setDashboardItemId] = useState(null);

  const notesKey = (idx) => `study-notes-${id}-${idx}`;

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);

        // 1) Load material
        const res = await fetch(`/api/study-materials/${id}`);
        if (!res.ok) throw new Error("Failed to load material");

        const data = await res.json();

        setMeta({
          topic: data.topic,
          difficultyLevel: data.difficultyLevel,
          status: data.status,
        });

        const mat = data.material || {};
        setMaterial(mat);

        // Restore notes
        const restoredNotes = {};
        mat.chapters?.forEach((_, i) => {
          const v = localStorage.getItem(notesKey(i));
          if (v) restoredNotes[i] = v;
        });
        setNotes(restoredNotes);

        // Restore completed
        const savedCompleted = localStorage.getItem(`completed-${id}`);
        if (savedCompleted) setCompleted(JSON.parse(savedCompleted));

        // Check if already in dashboard
        const checkRes = await fetch(
          `/api/dashboard-items/check?materialId=${id}`
        );
        const checkData = await checkRes.json();
        setAlreadyAdded(Boolean(checkData.added));

        // Find dashboard item (for progress updates)
        const dashRes = await fetch("/api/dashboard-items", {
          method: "GET",
          cache: "no-store",
        });
        const dashData = await dashRes.json();
        const match = (dashData.items || []).find(
          (it) => Number(it.materialId) === Number(id)
        );
        if (match) setDashboardItemId(match.id);
      } catch (err) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const chapters = material?.chapters ?? [];

  const toggleChapter = (idx) => {
    setOpenChapters((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleNoteChange = (idx, value) => {
    setNotes((prev) => ({ ...prev, [idx]: value }));
    localStorage.setItem(notesKey(idx), value);
  };

const toggleCompleted = async (idx) => {
  // 1. Local UI update
  const newState = { ...completed, [idx]: !completed[idx] };
  setCompleted(newState);
  localStorage.setItem(`completed-${id}`, JSON.stringify(newState));

  // Only update dashboard progress when NOT in generated mode
  if (mode === "generated") return;

  // Must have dashboard item ID AND chapters
  if (!dashboardItemId || chapters.length === 0) return;

  // 2. Calculate progress safely
  const done = Object.values(newState).filter(Boolean).length;
  const progress = Math.round((done / chapters.length) * 100);

  try {
    // 3. Update backend
    const res = await fetch(`/api/dashboard-items/${dashboardItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress }),
    });

    // 4. Optional: instantly reflect new progress in UI without reload  
    if (res.ok) {
      // This triggers UI to refresh via router cache invalidation  
      router.refresh?.();
    }
  } catch (err) {
    console.error("Progress update failed:", err);
  }
};


  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-8">
      {/* Back */}
      {mode !== "generated" && (
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-gray-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      )}

      {/* HEADER — SHOWN IN ALL MODES */}
      <section className="space-y-3">
        <h1 className="text-3xl font-extrabold">
          Study Guide: {meta?.topic}
        </h1>

        <p className="text-sm text-gray-600">
          Topic: <b>{meta?.topic}</b> · Difficulty:{" "}
          <b>{meta?.difficultyLevel}</b> · Status: <b>{meta?.status}</b>
        </p>

        {material?.summary && (
          <p className="text-sm text-gray-700">{material.summary}</p>
        )}

        {/* BUTTONS ONLY IN GENERATED MODE */}
        {mode === "generated" && (
          <>
            {!alreadyAdded ? (
              <button
                onClick={async () => {
                  try {
                    setAdding(true);
                    const res = await fetch("/api/dashboard-items/add", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ materialId: Number(id) }),
                    });
                    const data = await res.json();
                    if (res.ok || data.message === "Already added") {
                      router.push("/dashboard");
                      return;
                    }
                    throw new Error(data.error || "Failed");
                  } catch (err) {
                    alert(err.message);
                  } finally {
                    setAdding(false);
                  }
                }}
                disabled={adding}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm"
              >
                {adding ? "Adding…" : "Add to Dashboard"}
              </button>
            ) : (
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm"
              >
                Already added — Go to Dashboard
              </button>
            )}
          </>
        )}
      </section>

      {/* STUDY SESSION — HIDDEN IN GENERATED MODE */}
      {mode !== "generated" && (
        <section>
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
            <Sparkles className="h-4 w-4 text-sky-500" />
            <span>Study session</span>
          </div>

          {chapters.length === 0 && (
            <p className="text-sm text-gray-600">
              No chapters found. Try generating a new study material.
            </p>
          )}

          {chapters.map((ch, idx) => {
            const open = openChapters[idx] ?? true;
            const isCompleted = completed[idx] || false;
            const noteValue = notes[idx] || "";

            return (
              <div key={idx} className="rounded-xl border bg-slate-50 mb-3">
                <button
                  onClick={() => toggleChapter(idx)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    {open ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}

                    <span className="text-sm font-semibold">
                      {idx + 1}. {ch.title || `Chapter ${idx + 1}`}{" "}
                      {isCompleted && (
                        <span className="text-xs text-emerald-600 ml-2">
                          ✓ Completed
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="text-xs text-gray-500">
                    {ch.estimatedTime || "10–15 min"}
                  </span>
                </button>

                {open && (
                  <div className="px-4 py-3 space-y-3 border-t">
                    {/* CONTENT */}
                    {ch.description && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {ch.description}
                      </p>
                    )}

                    {/* BULLETS */}
                    {Array.isArray(ch.bullets) && ch.bullets.length > 0 && (
                      <ul className="pl-5 list-disc text-sm space-y-1">
                        {ch.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}

                    {/* COMPLETED TOGGLE */}
                    <button
                      onClick={() => toggleCompleted(idx)}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-700 border-emerald-400"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      {isCompleted ? "Completed ✓" : "Mark as Completed"}
                    </button>

                    {/* NOTES */}
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <StickyNote className="h-3 w-3" /> Notes
                      </div>
                      <textarea
                        value={noteValue}
                        onChange={(e) => handleNoteChange(idx, e.target.value)}
                        className="w-full border rounded-lg p-2 text-xs"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
