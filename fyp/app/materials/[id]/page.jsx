// app/materials/[id]/page.jsx

import StudyResult from "@/components/StudyResult";

export default async function MaterialPage({ params, searchParams }) {
  // ⭐ Unwrap both promises
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const rawId = resolvedParams.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const mode =
    resolvedSearch?.mode === "generated"
      ? "generated"
      : "view";

  if (!id) {
    return (
      <div className="p-6">
        <p className="bg-red-100 text-red-700 p-4 rounded-lg">
          Invalid material id.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <StudyResult id={id} mode={mode} />
    </div>
  );
}
