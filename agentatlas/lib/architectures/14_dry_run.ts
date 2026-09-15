import { Architecture } from "../types";

export const dryRun: Architecture = {
  id: "dry-run",
  number: 14,
  name: "Dry-Run Harness",
  part: 4,
  tagline: "Human approval gate between proposed and live action",
  controlFlow: "conditional",
  loopType: "none",
  memoryType: "none",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "1",
  keyDifferentiator: "Unlike Simulator (automated risk analysis), Dry-Run inserts a mandatory human-in-the-loop gate. The system previews exactly what it would do before asking 'approve or reject?'",
  color: "#ef4444",
  paradigm: "deliberative",
  conceptualInsight: "The same tool, two modes. The key insight is that publish_post(dry_run=True) and publish_post(dry_run=False) are the same function — the dry_run flag just controls whether the side effect fires. This means the human sees an exact preview of the real action, not a description of it. The human gate is architectural, not a prompt.",
  whenToUse: [
    { useCase: "Irreversible external actions requiring human sign-off", reason: "Publishing, deploying, deleting, sending — the human gate ensures a real person verifies the proposed action before any side effect fires." },
    { useCase: "Regulated environments where humans must remain in the loop", reason: "The dry_run flag makes it trivial to prove that no action is taken without a human decision — it's in the code, not just the prompt." },
    { useCase: "AI actions that represent the organization externally", reason: "Social posts, emails, and announcements carry reputational risk — a preview gate before every live action is the minimum viable safeguard." },
  ],
  strengths: [
    "Human sees the exact proposed action — not a description of it",
    "Approval gate is structural, not prompt-based (can't be bypassed)",
    "Both paths (approve/reject) are first-class logged outcomes",
    "Same tool function for dry-run and live — preview is guaranteed accurate",
  ],
  weaknesses: [
    "Synchronous human gate introduces latency proportional to human response time",
    "Human decision quality is now the bottleneck",
    "Not suited for high-throughput automated pipelines",
    "Dry-run flag requires tool authors to explicitly implement it",
  ],
  comparedTo: [
    { name: "Simulator", insight: "Simulator uses automated risk analysis (GBM + LLM risk manager) to make the go/no-go decision; Dry-Run inserts a human approval gate — the human's judgment, not an algorithm, makes the final call." },
    { name: "Metacognitive", insight: "Metacognitive routes to a human only when confidence is low; Dry-Run always routes to a human regardless of confidence — the human gate is unconditional." },
  ],
  a1a5Profile: {
    a1input: "Content brief — a description of what to publish, post, or send",
    a2decision: "LLM content generator proposes the post; rejection path logs the cancellation",
    a3memory: "None — stateless per-request; no cross-request memory",
    a4coordination: "Human approval gate — human sees exact dry-run preview and decides approve or reject (mandatory, unconditional)",
    a5output: "Live action execution (publish/send) on approval, or rejection log on rejection",
  },
  nodes: [
    { id: "start",   type: "start",  label: "START",         x: 200, y: 20 },
    { id: "propose", type: "llm",    label: "Propose\nPost", x: 200, y: 160, description: "LLM: writes the social media post based on the brief" },
    { id: "dry_run", type: "human",  label: "Dry-Run\nReview",x: 200, y: 300, description: "Human: runs tool with dry_run=True, shows preview, awaits human approval" },
    { id: "execute", type: "tool",   label: "Execute\nLive", x: 80,  y: 450, description: "Tool: runs tool with dry_run=False — real publication fires" },
    { id: "reject",  type: "rule",   label: "Reject\n& Log", x: 340, y: 450, description: "Rule: action cancelled, rejection reason logged" },
    { id: "end",     type: "end",    label: "END",           x: 200, y: 570 },
  ],
  edges: [
    { id: "e1", source: "start",   target: "propose" },
    { id: "e2", source: "propose", target: "dry_run" },
    { id: "e3", source: "dry_run", target: "execute", label: "approved", conditional: true },
    { id: "e4", source: "dry_run", target: "reject",  label: "rejected", conditional: true },
    { id: "e5", source: "execute", target: "end" },
    { id: "e6", source: "reject",  target: "end" },
  ],
  demoInput: "Write a tweet announcing our new product launch for InnovateTech's AI writing assistant",
  demoOutput: "[APPROVED & LIVE] '🚀 Introducing InnovateTech AI Writer — your intelligent writing companion! Create better content 10x faster. Try it free: innovatetech.com/ai-writer #AI #ProductLaunch'",
  executionTrace: [
    {
      activeNodeId: "propose",
      label: "Step 1 — LLM proposes the post",
      stateSnapshot: { user_request: "Announce InnovateTech AI Writer launch", proposed_post: null },
      explanation: "LLM writes a tweet following social media best practices: emoji opener, clear value prop, CTA, hashtags.",
    },
    {
      activeNodeId: "dry_run",
      label: "Step 2 — Dry-run preview",
      stateSnapshot: { proposed_post: "🚀 Introducing InnovateTech AI Writer...", dry_run_log: "[DRY RUN] Would post to Twitter: '🚀 Introducing InnovateTech AI Writer...'", review_decision: null },
      explanation: "publish_post(dry_run=True) logs what it would do without doing it. Human sees the preview panel and types 'approve' or 'reject'.",
    },
    {
      activeNodeId: "execute",
      label: "Step 3 — Human approved → live execution",
      stateSnapshot: { review_decision: "approved" },
      explanation: "publish_post(dry_run=False) fires. Tweet goes live. Final status: '[LIVE] Post successfully published.'",
    },
  ],
  codeSnippets: {
    dry_run: `class SocialMediaAPI:
    def publish_post(self, post: SocialMediaPost, dry_run: bool = True) -> Dict[str, Any]:
        if dry_run:
            log = f"[DRY RUN] Would post to Twitter: '{post}'"
            console.print(Panel(log, title="Preview", border_style="yellow"))
            return log
        else:
            # Real API call here
            return f"[LIVE] Successfully posted: '{post}'"

def dry_run_review_node(state: AgentState):
    api = SocialMediaAPI()
    preview = api.publish_post(state["proposed_post"], dry_run=True)
    # Human gate
    decision = console.input("[green]Approve? (approve/reject): [/green]")
    return {
        "dry_run_log": preview,
        "review_decision": decision.lower().strip()
    }`,
    propose: `def route_after_review(state: AgentState):
    if state["review_decision"] == "approve":
        return "execute_live"
    return "reject"

def execute_live_node(state: AgentState):
    api = SocialMediaAPI()
    result = api.publish_post(state["proposed_post"], dry_run=False)
    return {"final_status": result}

def reject_node(state: AgentState):
    return {"final_status": f"[CANCELLED] '{state['proposed_post']}'"}`,
  },
};
