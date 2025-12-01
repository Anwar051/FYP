"use client";

export default function TopicInput({
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  onPrev,
  onGenerate,
  isGenerating = false,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Enter topic or paste the content for which you want to generate study material
        </label>
        <textarea
          className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          rows={6}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Python, OOP, Laplace transforms, knee biomechanics..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Select the difficulty level
        </label>
        <select
          className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? "Saving..." : "Generate"}
        </button>
      </div>
    </div>
  );
}
