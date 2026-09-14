"use client";
import { TraceStep } from "@/lib/types";

interface Props {
  steps: TraceStep[];
  currentStep: number;
  onStep: (index: number) => void;
}

export default function StepController({ steps, currentStep, onStep }: Props) {
  const step = steps[currentStep];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-400">
          Step {currentStep + 1} / {steps.length}
        </span>
        <span className="font-semibold text-slate-800 text-sm">{step?.label}</span>
      </div>

      {step && (
        <p className="text-sm text-slate-600 leading-relaxed">{step.explanation}</p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 hover:bg-slate-200 transition-colors font-medium"
        >
          ← Prev
        </button>

        <div className="flex gap-1 flex-1 justify-center">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => onStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep ? "bg-indigo-500 scale-125" : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => onStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 hover:bg-slate-200 transition-colors font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
