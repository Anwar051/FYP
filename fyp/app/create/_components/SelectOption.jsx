"use client";

export default function SelectOption({
  options,
  selectedId,
  onSelect,
  onNext,
  title,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {options.map(({ id, label, Icon }) => {
          const active = selectedId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition hover:border-gray-900 ${
                active
                  ? "border-gray-900 bg-gray-900 text-white shadow"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
}
