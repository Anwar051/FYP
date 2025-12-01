"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import SelectOption from "@/app/create/_components/SelectOption";
import TopicInput from "@/app/create/_components/TopicInput";
import {
  GraduationCap,
  BriefcaseBusiness,
  PencilLine,
  Code2,
  BookOpenCheck,
} from "lucide-react";

const OPTIONS = [
  { id: "exam", label: "Exam", Icon: GraduationCap },
  { id: "job", label: "Job Interview", Icon: BriefcaseBusiness },
  { id: "practice", label: "Practice", Icon: PencilLine },
  { id: "coding", label: "Coding Prep", Icon: Code2 },
  { id: "other", label: "Other", Icon: BookOpenCheck },
];

export default function CreateNewDialog({ onGenerate }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [isSaving, setIsSaving] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset form when modal closes
  const resetForm = () => {
    setStep(1);
    setSelected(null);
    setTopic("");
    setDifficulty("Easy");
    setIsSaving(false);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetForm, 150);
  };

  const handleGenerate = async () => {
    if (!selected || !topic.trim()) {
      alert("Please choose a purpose and enter a topic.");
      return;
    }

    // Allow parent override
    if (onGenerate) {
      onGenerate({ type: selected, topic: topic.trim(), difficulty });
      handleClose();
      return;
    }

    try {
      setIsSaving(true);

      const res = await fetch("/api/study-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selected,
          topic: topic.trim(),
          difficulty,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", text);
        alert("Failed to generate study guide.");
        return;
      }

      const data = await res.json();
      if (!data.id) {
        alert("Server error: Missing ID.");
        return;
      }

      // SUCCESS → close modal and redirect
      handleClose();
      window.location.href = `/materials/${data.id}`;
    } catch (err) {
      console.error(err);
      alert("Unexpected error while generating guide.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* OPEN BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
      >
        <Plus className="h-4 w-4" />
        Create New
      </button>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

          <div
            className="absolute inset-0 m-auto flex max-h-[92vh] w-full max-w-3xl items-start justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-xl">

              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Start Building Your Personal Study Material
                  </h3>
                  <p className="text-sm text-gray-600">
                    Fill all details to generate your study guide.
                  </p>
                </div>

                <button
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* CONTENT */}
              <div className="px-6 py-5">
                {step === 1 ? (
                  <SelectOption
                    options={OPTIONS}
                    selectedId={selected}
                    onSelect={setSelected}
                    onNext={() => selected && setStep(2)}
                    title="What type of material do you want to generate?"
                  />
                ) : (
                  <TopicInput
                    topic={topic}
                    setTopic={setTopic}
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    isGenerating={isSaving}
                    onPrev={() => setStep(1)}
                    onGenerate={handleGenerate}
                  />
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
