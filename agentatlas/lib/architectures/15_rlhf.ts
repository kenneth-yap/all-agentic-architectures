import { Architecture } from "../types";

export const rlhf: Architecture = {
  id: "rlhf",
  number: 15,
  name: "Self-Improvement / RLHF",
  part: 5,
  tagline: "Generate → Critique → Revise until approved, then remember",
  controlFlow: "conditional",
  loopType: "iterative",
  memoryType: "none",
  toolUse: false,
  llmDriven: true,
  llmCallsPerTask: "2–6+ per run",
  keyDifferentiator: "Unlike Reflection (single fixed pass), this is a loop with a quality gate. The RLHF extension stores approved outputs as few-shot examples, improving baseline quality across future runs.",
  color: "#8b5cf6",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "generate", type: "llm", label: "Generate\nDraft", x: 250, y: 110, description: "Junior Copywriter generates email (optionally using past approved examples)" },
    { id: "critique", type: "llm", label: "Critique", x: 250, y: 230, description: "Senior Editor scores draft 1-10 and provides specific feedback" },
    { id: "revise", type: "llm", label: "Revise", x: 250, y: 350, description: "Junior Copywriter rewrites using the original draft + critique" },
    { id: "memory", type: "memory", label: "Save to\nGold Memory", x: 250, y: 460, description: "Approved emails stored as few-shot examples for future runs" },
    { id: "end", type: "end", label: "END", x: 250, y: 550 },
  ],
  edges: [
    { id: "e1", source: "start", target: "generate" },
    { id: "e2", source: "generate", target: "critique" },
    { id: "e3", source: "critique", target: "revise", label: "score < 8, revision < 3", conditional: true },
    { id: "e4", source: "critique", target: "memory", label: "approved or max revisions", conditional: true },
    { id: "e5", source: "revise", target: "critique" },
    { id: "e6", source: "memory", target: "end" },
  ],
  demoInput: "Write a marketing email for InsightSphere, an AI analytics platform",
  demoOutput: "Subject: Stop Guessing. Start Knowing. [InsightSphere]\n\nYour competitors are making data-driven decisions while you're still relying on gut instinct.\n\nInsightSphere turns your raw data into actionable insights in minutes — no SQL required.\n→ Try free for 14 days: insightsphere.ai/trial",
  executionTrace: [
    {
      activeNodeId: "generate",
      label: "Step 1 — First draft",
      stateSnapshot: { user_request: "Marketing email for InsightSphere", draft_email: null, revision_number: 0 },
      explanation: "Junior Copywriter generates a generic first draft. Subject: 'Introducing InsightSphere — AI Analytics for Your Business.' Body: generic feature list with no compelling hook.",
    },
    {
      activeNodeId: "critique",
      label: "Step 2 — Critique: score 4/10",
      stateSnapshot: { draft_email: { subject: "Introducing InsightSphere", body: "Generic feature list..." }, critique: null },
      explanation: "Senior Editor scores 4/10: 'Subject line is boring and generic. No pain point addressed in opening. CTA buried. No urgency. Missing emotional hook.'",
    },
    {
      activeNodeId: "revise",
      label: "Step 3 — Revise with feedback",
      stateSnapshot: { critique: { score: 4, is_approved: false, feedback_points: ["boring subject", "no pain point", "weak CTA"] }, revision_number: 1 },
      explanation: "Junior Copywriter rewrites incorporating all critique points: pain-point opener, better CTA, urgency added.",
    },
    {
      activeNodeId: "critique",
      label: "Step 4 — Critique: score 9/10 ✓",
      stateSnapshot: { draft_email: { subject: "Stop Guessing. Start Knowing.", body: "Your competitors are making data-driven decisions..." }, revision_number: 1 },
      explanation: "Senior Editor approves: 9/10. 'Strong pain-point opener, clear value prop, compelling CTA, appropriate urgency.' is_approved=True.",
    },
    {
      activeNodeId: "memory",
      label: "Step 5 — Save to Gold Memory",
      stateSnapshot: { critique: { score: 9, is_approved: true } },
      explanation: "Approved email saved to GoldStandardMemory. Next run on a different task will inject this as a few-shot example — reducing revision cycles from 2 to 0.",
    },
  ],
  codeSnippets: {
    critique: `class Critique(BaseModel):
    score: int           # 1-10
    feedback_points: List[str]
    is_approved: bool    # True if score >= 8

def critique_node(state: AgentState):
    prompt = f"""You are a Senior Marketing Editor.
Score this email 1-10 and list specific improvements:
Subject: {state['draft_email'].subject}
Body: {state['draft_email'].body}"""
    critique = llm.with_structured_output(Critique).invoke(prompt)
    return {"critique": critique}

def should_continue(state: AgentState):
    if state["critique"].is_approved or state["revision_number"] >= 3:
        return "save_to_memory"
    return "revise"`,
    generate: `class GoldStandardMemory:
    """Stores approved emails as few-shot examples."""
    approved_emails: List[MarketingEmail] = []

    def add(self, email: MarketingEmail):
        self.approved_emails.append(email)

    def get_examples(self) -> str:
        return "\n\n".join([f"EXAMPLE:\nSubject: {e.subject}\n{e.body}"
                            for e in self.approved_emails])

def generate_node_with_memory(state: AgentState):
    examples = gold_memory.get_examples()
    prompt = f"""Write a marketing email.
{f"Learn from these approved examples:{chr(10)}{examples}" if examples else ""}
Task: {state['user_request']}"""
    return {"draft_email": llm.with_structured_output(MarketingEmail).invoke(prompt)}`,
  },
};
