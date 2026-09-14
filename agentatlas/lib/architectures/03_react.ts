import { Architecture } from "../types";

export const react: Architecture = {
  id: "react",
  number: 3,
  name: "ReAct",
  part: 1,
  tagline: "Reason + Act in a multi-step loop",
  controlFlow: "conditional",
  loopType: "reactive",
  memoryType: "message_history",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "3–10+",
  keyDifferentiator: "Unlike Tool Use (one tool call), ReAct loops back after each observation — the agent chains tool calls adaptively until the problem is solved.",
  color: "#6366f1",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "agent", type: "llm", label: "Agent\nNode", x: 250, y: 110, description: "Reasons about what to do next based on all prior observations" },
    { id: "tool", type: "tool", label: "Tool\nNode", x: 250, y: 240, description: "Executes the tool call and feeds result back to Agent" },
    { id: "end", type: "end", label: "END", x: 250, y: 360 },
  ],
  edges: [
    { id: "e1", source: "start", target: "agent" },
    { id: "e2", source: "agent", target: "tool", label: "has tool_calls", conditional: true },
    { id: "e3", source: "agent", target: "end", label: "no tool_calls", conditional: true },
    { id: "e4", source: "tool", target: "agent", label: "← loop back" },
  ],
  demoInput: "Who is the CEO of the company that produced Dune (2021), and what was the budget of their most recent film?",
  demoOutput: "Dune was produced by Legendary Entertainment, whose CEO is Joshua Grode. Their most recent major film, Dune: Part Two (2024), had a budget of approximately $190 million.",
  executionTrace: [
    {
      activeNodeId: "agent",
      label: "Step 1 — Reason: first search needed",
      stateSnapshot: { messages: [{ role: "human", content: "Who is the CEO of the company that produced Dune?" }] },
      explanation: "Agent reasons: 'I need to find who produced Dune first.' Calls search('Dune 2021 production company').",
    },
    {
      activeNodeId: "tool",
      label: "Step 2 — Act: search for producer",
      stateSnapshot: { messages: ["human: ...", "ai: [tool_call: search Dune 2021 production]"] },
      explanation: "TavilySearch returns: 'Dune was produced by Legendary Entertainment.'",
    },
    {
      activeNodeId: "agent",
      label: "Step 3 — Reason: now need the CEO",
      stateSnapshot: { messages: ["...", "tool: Legendary Entertainment produced Dune"] },
      explanation: "Agent observes the result and reasons: 'Now I need the CEO of Legendary Entertainment.' Calls a second search.",
    },
    {
      activeNodeId: "tool",
      label: "Step 4 — Act: search for CEO",
      stateSnapshot: { messages: ["...", "ai: [tool_call: search Legendary Entertainment CEO]"] },
      explanation: "Returns: 'Joshua Grode is CEO of Legendary Entertainment.'",
    },
    {
      activeNodeId: "agent",
      label: "Step 5 — Reason: need their latest film budget",
      stateSnapshot: { messages: ["...", "tool: Joshua Grode is CEO"] },
      explanation: "One more hop needed: latest film budget. Agent calls search('Legendary Entertainment latest film budget 2024').",
    },
    {
      activeNodeId: "tool",
      label: "Step 6 — Act: final search",
      stateSnapshot: { messages: ["...", "ai: [tool_call: Legendary latest film budget]"] },
      explanation: "Returns: 'Dune: Part Two (2024) — budget ~$190 million.'",
    },
    {
      activeNodeId: "agent",
      label: "Step 7 — Final answer (no more tool_calls)",
      stateSnapshot: { messages: ["...", "tool: Dune Part Two budget $190M"] },
      explanation: "Agent has all the information. No more tool_calls — routes to END with the complete synthesized answer.",
    },
  ],
  codeSnippets: {
    agent: `# Same two-node structure as Tool Use, but the loop-back edge is the key difference
def agent_node(state: AgentState):
    # All prior messages (including tool results) are in context
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}`,
    tool: `# The critical architectural difference vs. Tool Use:
# Edge from ToolNode goes BACK to agent, not to END

graph.add_edge("call_tool", "agent")  # ← this creates the loop

# Tool Use equivalent (no loop):
# graph.add_edge("call_tool", "__end__")`,
  },
};
