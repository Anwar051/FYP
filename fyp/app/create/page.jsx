// app/create/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SelectOption from "./_components/SelectOption";
import TopicInput from "./_components/TopicInput";
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

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [isSaving, setIsSaving] = useState(false);

  const nextFromOptions = () => selected && setStep(2);
  const backToOptions = () => setStep(1);

  const handleGenerate = async () => {
    if (!selected || !topic.trim()) {
      alert("Please choose a purpose and enter a topic.");
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
        alert("Failed to generate study material.");
        return;
      }

      const data = await res.json();
      if (!data.id) {
        alert("Server did not return an id.");
        return;
      }

      router.push(`/materials/${data.id}?mode=generated`);

    } catch (err) {
      console.error(err);
      alert("Unexpected error while generating material.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Start Building Your Personal Study Material
          </h1>
          <p className="mt-2 text-gray-600">
            Fill all details in order to generate study material for your next project.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {step === 1 ? (
            <SelectOption
              options={OPTIONS}
              selectedId={selected}
              onSelect={setSelected}
              onNext={nextFromOptions}
              title="For which do you want to create your personal study material?"
            />
          ) : (
            <TopicInput
              topic={topic}
              setTopic={setTopic}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              isGenerating={isSaving}
              onPrev={backToOptions}
              onGenerate={handleGenerate}
            />
          )}
        </section>
      </div>
    </main>
  );
}
