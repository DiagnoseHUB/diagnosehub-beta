import Link from "next/link";
import type { InstructionGuide } from "../types/instruction";

type InstructionCardProps = {
  instruction: InstructionGuide;
};

function getDifficultyLabel(difficulty: InstructionGuide["difficulty"]) {
  if (difficulty === "leicht") return "Leicht";
  if (difficulty === "mittel") return "Mittel";
  return "Schwer";
}

function getDifficultyClass(difficulty: InstructionGuide["difficulty"]) {
  if (difficulty === "leicht") {
    return "bg-green-100 text-green-800";
  }

  if (difficulty === "mittel") {
    return "bg-yellow-100 text-yellow-800";
  }

  return "bg-red-100 text-red-800";
}

export default function InstructionCard({ instruction }: InstructionCardProps) {
  return (
    <Link
      href={`/anleitungen/${instruction.slug}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
          {instruction.category}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyClass(
            instruction.difficulty
          )}`}
        >
          {getDifficultyLabel(instruction.difficulty)}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-950 group-hover:text-blue-700">
        {instruction.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {instruction.subtitle}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {instruction.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
        <span>{instruction.estimatedTime}</span>
        <span className="font-semibold text-blue-700">Öffnen →</span>
      </div>
    </Link>
  );
}