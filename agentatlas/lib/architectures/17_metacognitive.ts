import { Architecture } from "../types";

export const metacognitive: Architecture = {
  id: "metacognitive",
  number: 17,
  name: "Reflexive Metacognitive",
  part: 4,
  tagline: "Agent reasons about its own fitness before attempting the task",
  controlFlow: "conditional",
  loopType: "none",
  memoryType: "none",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "2–3",
  keyDifferentiator: "Only architecture with an explicit self-model as a first-class data structure. The agent formally reasons about what it DOESN'T know before answering — enabling principled escalation.",
  color: "#ef4444",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "analyze", type: "llm", label: "Metacognitive\nAnalysis", x: 250, y: 110, description: "Reviews self-model against the query; produces strategy + confidence score" },
    { id: "reason", type: "llm", label: "Reason\nDirectly", x: 80, y: 280, description: "High confidence (>0.7): answer from knowledge" },
    { id: "call_tool", type: "tool", label: "Call\nTool", x: 250, y: 280, description: "Medium confidence (0.5–0.7): use a specialized tool" },
    { id: "escalate", type: "human", label: "Escalate\nto Human", x: 420, y: 280, description: "Low confidence (<0.5): route to a human expert" },
    { id: "synthesize", type: "llm", label: "Synthesize\nTool Result", x: 250, y: 400, description: "Converts raw tool output into a patient-facing response" },
    { id: "end", type: "end", label: "END", x: 250, y: 490 },
  ],
  edges: [
    { id: "e1", source: "start", target: "analyze" },
    { id: "e2", source: "analyze", target: "reason", label: "reason_directly", conditional: true },
    { id: "e3", source: "analyze", target: "call_tool", label: "use_tool", conditional: true },
    { id: "e4", source: "analyze", target: "escalate", label: "escalate", conditional: true },
    { id: "e5", source: "reason", target: "end" },
    { id: "e6", source: "call_tool", target: "synthesize" },
    { id: "e7", source: "synthesize", target: "end" },
    { id: "e8", source: "escalate", target: "end" },
  ],
  demoInput: "I have crushing chest pain and my left arm feels numb",
  demoOutput: "[ESCALATED] This symptom pattern requires immediate medical attention. Please call 911 or go to the nearest emergency room immediately. Do not drive yourself. These symptoms may indicate a cardiac emergency.",
  executionTrace: [
    {
      activeNodeId: "analyze",
      label: "Step 1 — Metacognitive analysis (medical emergency query)",
      stateSnapshot: {
        user_query: "I have crushing chest pain and my left arm feels numb",
        self_model: {
          name: "MedicalTriageAgent",
          knowledge_domain: ["symptom information", "general health education"],
          available_tools: ["DrugInteractionChecker"],
          confidence_threshold: 0.7,
        },
      },
      explanation: "Agent reviews its self-model: it knows general health info but is NOT a doctor, has NO diagnostic tools, and has confidence_threshold=0.7. Chest pain + left arm numbness = potential cardiac emergency. Confidence in own ability to help: 0.10. Strategy: ESCALATE.",
    },
    {
      activeNodeId: "escalate",
      label: "Step 2 — Escalate to human",
      stateSnapshot: {
        metacognitive_analysis: { confidence: 0.10, strategy: "escalate", reasoning: "Potential cardiac emergency — beyond agent's scope" },
        final_response: null,
      },
      explanation: "Agent routes directly to escalate node. Outputs: 'WHEN IN DOUBT, ESCALATE' safety rule triggered. Refers patient to 911 immediately. No attempt to self-diagnose.",
    },
  ],
  codeSnippets: {
    analyze: `class AgentSelfModel(BaseModel):
    name: str
    role: str
    knowledge_domain: List[str]
    available_tools: List[str]
    confidence_threshold: float  # escalate below this

class MetacognitiveAnalysis(BaseModel):
    confidence: float  # 0.0-1.0
    strategy: str     # "reason_directly" | "use_tool" | "escalate"
    reasoning: str
    tool_to_use: Optional[str]
    tool_args: Optional[Dict]

def metacognitive_analysis_node(state: AgentState):
    self_model = state["self_model"]
    prompt = f"""You are {self_model.name}.
Your knowledge domain: {self_model.knowledge_domain}
Your tools: {self_model.available_tools}
Your confidence threshold: {self_model.confidence_threshold}

Analyze this query: {state['user_query']}

SAFETY RULE: WHEN IN DOUBT, ESCALATE.
Choose strategy: reason_directly | use_tool | escalate"""
    analysis = llm.with_structured_output(MetacognitiveAnalysis).invoke(prompt)
    return {"metacognitive_analysis": analysis}`,
    call_tool: `# Example: drug interaction query (medium confidence → use_tool)
# Query: "Is it safe to take Ibuprofen with Lisinopril?"
# → confidence: 0.95, strategy: "use_tool", tool: "DrugInteractionChecker"

@tool
def DrugInteractionChecker(drug1: str, drug2: str) -> str:
    """Check for dangerous drug interactions."""
    interactions = INTERACTION_DB.get((drug1, drug2), "No known interaction")
    return interactions

def call_tool_node(state: AgentState):
    analysis = state["metacognitive_analysis"]
    tool_fn = available_tools[analysis.tool_to_use]
    result = tool_fn.invoke(analysis.tool_args)
    return {"tool_output": result}`,
  },
};
