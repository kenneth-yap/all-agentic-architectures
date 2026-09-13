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
  llmCallsPerTask: "2",
  keyDifferentiator: "Unlike Simulator (automated risk analysis), Dry-Run inserts a mandatory human-in-the-loop gate. The system previews exactly what it would do before asking 'approve or reject?'",
  color: "#ef4444",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "propose", type: "llm", label: "Propose\nPost", x: 250, y: 110, description: "LLM writes the social media post based on the brief" },
    { id: "dry_run", type: "human", label: "Dry-Run\nReview", x: 250, y: 230, description: "Runs tool with dry_run=True (logs only), shows preview, awaits human input" },
    { id: "execute", type: "tool", label: "Execute\nLive", x: 140, y: 370, description: "Runs tool with dry_run=False — real publication" },
    { id: "reject", type: "rule", label: "Reject\n& Log", x: 360, y: 370, description: "Action cancelled, reason logged" },
    { id: "end", type: "end", label: "END", x: 250, y: 470 },
  ],
  edges: [
    { id: "e1", source: "start", target: "propose" },
    { id: "e2", source: "propose", target: "dry_run" },
    { id: "e3", source: "dry_run", target: "execute", label: "approved", conditional: true },
    { id: "e4", source: "dry_run", target: "reject", label: "rejected", conditional: true },
    { id: "e5", source: "execute", target: "end" },
    { id: "e6", source: "reject", target: "end" },
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
    def publish_post(self, post: str, dry_run: bool = False) -> str:
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
