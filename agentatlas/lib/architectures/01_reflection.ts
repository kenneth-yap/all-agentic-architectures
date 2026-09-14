import { Architecture } from "../types";

export const reflection: Architecture = {
  id: "reflection",
  number: 1,
  name: "Reflection",
  part: 1,
  tagline: "Generate → Critique → Refine",
  controlFlow: "linear",
  loopType: "fixed",
  memoryType: "none",
  toolUse: false,
  llmDriven: true,
  llmCallsPerTask: "3",
  keyDifferentiator: "The agent acts as its own code reviewer — a fixed three-step internal loop with no external tools needed.",
  color: "#6366f1",
  paradigm: "deliberative",
  conceptualInsight: "Mirrors the scientific method: hypothesis (generate) → falsification (critique) → revision (refine). No memory or tools required — quality emerges from structured self-assessment alone.",
  a1a5Profile: {
    a1input: "User prompt — text request for generation task",
    a2decision: "LLM with 3-pass critique loop: Generator (Junior Dev) → Critic (Senior Engineer) → Refiner (Architect)",
    a3memory: "In-context message history (draft and critique passed between nodes)",
    a4coordination: "None — single-agent, no inter-agent routing",
    a5output: "Final refined text response (code, prose, or analysis)",
  },
  whenToUse: [
    { useCase: "Document or code generation", reason: "A quality threshold matters more than speed — the critique step catches errors before delivery." },
    { useCase: "Single-LLM quality improvement", reason: "No external data or tools needed — the same LLM critiques its own output from a different persona." },
    { useCase: "Baseline for comparing other architectures", reason: "3-call fixed cost with predictable quality uplift makes it easy to measure improvement." },
  ],
  strengths: [
    "Structured quality gate without human review",
    "Predictable 3-LLM-call cost",
    "No external memory or tools required",
    "Works on any generative task (code, prose, analysis)",
  ],
  weaknesses: [
    "Fixed passes — no adaptive loop or quality threshold",
    "Critic and generator share model biases if same LLM",
    "No factual grounding — loops over the same knowledge",
    "Can't recover from fundamental knowledge gaps",
  ],
  comparedTo: [
    { name: "Self-Improvement (RLHF)", insight: "Reflection does one fixed Critique→Refine pass; RLHF loops until a quality score is met and stores approved outputs as training data for future runs." },
  ],
  nodes: [
    { id: "start",     type: "start", label: "START",            x: 200, y: 20 },
    { id: "generator", type: "llm",   label: "Generate\nDraft",  x: 200, y: 160, description: "LLM (Junior Dev persona): writes first draft from the request" },
    { id: "critic",    type: "llm",   label: "Critique\nDraft",  x: 200, y: 300, description: "LLM (Senior Engineer persona): identifies bugs and inefficiencies" },
    { id: "refiner",   type: "llm",   label: "Refine\nResponse", x: 200, y: 440, description: "LLM (Architect persona): rewrites incorporating critique feedback" },
    { id: "end",       type: "end",   label: "END",              x: 200, y: 560 },
  ],
  edges: [
    { id: "e1", source: "start",     target: "generator" },
    { id: "e2", source: "generator", target: "critic" },
    { id: "e3", source: "critic",    target: "refiner" },
    { id: "e4", source: "refiner",   target: "end" },
  ],
  demoInput: "Write a function to compute the nth Fibonacci number",
  demoOutput: "def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n# O(n) time, O(1) space — improved from naive O(2^n) recursion",
  executionTrace: [
    {
      activeNodeId: "generator",
      label: "Step 1 — Generate",
      stateSnapshot: { user_request: "Write a Fibonacci function", draft: null, critique: null, refined_code: null },
      explanation: "Junior Dev generates a naive recursive implementation: def fib(n): return fib(n-1)+fib(n-2). Fast to write, but O(2^n).",
    },
    {
      activeNodeId: "critic",
      label: "Step 2 — Critique",
      stateSnapshot: { user_request: "Write a Fibonacci function", draft: "def fib(n): return fib(n-1)+fib(n-2) if n>1 else n", critique: null, refined_code: null },
      explanation: "Senior Engineer critiques: exponential time complexity, no memoization, stack overflow for large n. Suggests iterative approach.",
    },
    {
      activeNodeId: "refiner",
      label: "Step 3 — Refine",
      stateSnapshot: { user_request: "Write a Fibonacci function", draft: "def fib(n): ...", critique: { score: 4, issues: ["O(2^n) complexity", "no memoization"] }, refined_code: null },
      explanation: "Architect rewrites to iterative O(n) solution with O(1) space — incorporating all critique feedback.",
    },
  ],
  codeSnippets: {
    generator: `class DraftCode(BaseModel):
    code: str
    explanation: str

def generator_node(state: ReflectionState):
    prompt = f"""You are a Junior Developer.
Write Python code for: {state['user_request']}"""
    response = llm.with_structured_output(DraftCode).invoke(prompt)
    return {"draft": response}`,
    critic: `class Critique(BaseModel):
    score: int  # 1-10
    issues: List[str]
    suggestions: List[str]

def critic_node(state: ReflectionState):
    prompt = f"""You are a Senior Engineer.
Review this code and identify bugs/inefficiencies:
{state['draft'].code}"""
    response = llm.with_structured_output(Critique).invoke(prompt)
    return {"critique": response}`,
    refiner: `class RefinedCode(BaseModel):
    code: str
    improvements: List[str]

def refiner_node(state: ReflectionState):
    prompt = f"""Rewrite the code addressing these issues:
Original: {state['draft'].code}
Issues: {state['critique'].issues}"""
    response = llm.with_structured_output(RefinedCode).invoke(prompt)
    return {"refined_code": response}`,
  },
};
