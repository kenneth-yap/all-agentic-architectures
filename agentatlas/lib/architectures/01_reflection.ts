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
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "generator", type: "llm", label: "Generator\nNode", x: 250, y: 100, description: "Junior Dev: writes first draft code" },
    { id: "critic", type: "llm", label: "Critic\nNode", x: 250, y: 220, description: "Senior Engineer: evaluates for bugs and efficiency" },
    { id: "refiner", type: "llm", label: "Refiner\nNode", x: 250, y: 340, description: "Architect: rewrites code using the critique" },
    { id: "end", type: "end", label: "END", x: 250, y: 440 },
  ],
  edges: [
    { id: "e1", source: "start", target: "generator" },
    { id: "e2", source: "generator", target: "critic" },
    { id: "e3", source: "critic", target: "refiner" },
    { id: "e4", source: "refiner", target: "end" },
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
