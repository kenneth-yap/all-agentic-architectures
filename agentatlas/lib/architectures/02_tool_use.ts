import { Architecture } from "../types";

export const toolUse: Architecture = {
  id: "tool-use",
  number: 2,
  name: "Tool Use",
  part: 1,
  tagline: "LLM decides when to call external tools",
  controlFlow: "conditional",
  loopType: "reactive",
  memoryType: "message_history",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "2–4",
  keyDifferentiator: "Breaks the knowledge-cutoff wall — the LLM decides if and when to call external APIs, then synthesizes the result.",
  color: "#6366f1",
  paradigm: "deliberative",
  conceptualInsight: "Extends LLM capability beyond training data cutoff. The model decides what external information it needs, fetches it, and integrates it — acting as both planner and executor in a single node.",
  whenToUse: [
    { useCase: "Tasks requiring real-time or external data", reason: "LLM alone can't access current prices, weather, or live databases — tools bridge the gap." },
    { useCase: "Multi-step information retrieval", reason: "Agent decides when to search and what to search for based on intermediate results." },
    { useCase: "Database-backed Q&A", reason: "Execute SQL/API calls grounded in current data rather than training knowledge." },
  ],
  strengths: [
    "Extends knowledge beyond training cutoff",
    "Agent decides when and whether to call tools",
    "Can chain multiple tool calls adaptively",
    "Message history preserves all tool results as context",
  ],
  weaknesses: [
    "Tool call overhead adds latency per turn",
    "Depends entirely on tool reliability",
    "Needs robust tool schemas for reliable calling",
    "Can loop excessively on tool errors without a guard",
  ],
  comparedTo: [
    { name: "ReAct", insight: "Tool Use calls tools when needed and synthesizes; ReAct explicitly interleaves Thought→Action→Observation, making the reasoning trace visible in the scratchpad." },
  ],
  nodes: [
    { id: "start", type: "start",      label: "START",           x: 200, y: 20 },
    { id: "agent", type: "a2decision",  label: "LLM\nAgent",      x: 200, y: 160, description: "A2 (Decision): decides whether to call a tool or answer directly from context" },
    { id: "tool",  type: "a5output",    label: "Tool\nExecution", x: 440, y: 160, description: "A5 (Output): executes TavilySearch and returns result as ToolMessage back to agent" },
    { id: "end",   type: "end",         label: "END",             x: 200, y: 300 },
  ],
  edges: [
    { id: "e1", source: "start", target: "agent" },
    { id: "e2", source: "agent", target: "tool", label: "tool_calls", conditional: true },
    { id: "e3", source: "agent", target: "end",  label: "no tool_calls", conditional: true },
    { id: "e4", source: "tool",  target: "agent" },
  ],
  demoInput: "What were the major announcements at Apple WWDC 2024?",
  demoOutput: "At WWDC 2024, Apple announced Apple Intelligence (on-device AI), visionOS 2 with new spatial computing features, iOS 18 with AI-powered Siri upgrades, and the M4 chip series. The event focused heavily on AI integration across all Apple platforms.",
  executionTrace: [
    {
      activeNodeId: "agent",
      label: "Step 1 — Agent receives query",
      stateSnapshot: { messages: [{ role: "human", content: "What were the major announcements at Apple WWDC 2024?" }] },
      explanation: "Agent sees the question. Its training data may be stale, so it decides to call TavilySearch to get current information.",
    },
    {
      activeNodeId: "tool",
      label: "Step 2 — Tool executes",
      stateSnapshot: { messages: ["human: What were...", { role: "ai", content: "", tool_calls: [{ name: "tavily_search", args: { query: "Apple WWDC 2024 announcements" } }] }] },
      explanation: "TavilySearch fires, scrapes recent web results about WWDC 2024, and returns them as a ToolMessage added to the message history.",
    },
    {
      activeNodeId: "agent",
      label: "Step 3 — Agent synthesizes",
      stateSnapshot: { messages: ["human: What were...", "ai: [tool_call]", { role: "tool", content: "Search results: Apple Intelligence, visionOS 2..." }] },
      explanation: "Agent now has the search results in context. No more tool_calls needed — it writes a final synthesized answer and routes to END.",
    },
  ],
  codeSnippets: {
    agent: `tools = [TavilySearchResults(max_results=3)]
llm_with_tools = llm.bind_tools(tools)

def agent_node(state: AgentState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def router(state: AgentState):
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "call_tool"
    return "__end__"`,
    tool: `from langgraph.prebuilt import ToolNode

tool_node = ToolNode(tools)

# LangGraph graph wiring:
graph.add_node("agent", agent_node)
graph.add_node("call_tool", tool_node)
graph.add_conditional_edges("agent", router)
graph.add_edge("call_tool", "agent")`,
  },
};
