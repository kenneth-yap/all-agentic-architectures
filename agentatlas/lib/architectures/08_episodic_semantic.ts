import { Architecture } from "../types";

export const episodicSemantic: Architecture = {
  id: "episodic-semantic",
  number: 8,
  name: "Episodic + Semantic Memory",
  part: 3,
  tagline: "FAISS remembers what happened; Neo4j knows facts about you",
  controlFlow: "linear",
  loopType: "none",
  memoryType: "faiss+neo4j",
  toolUse: false,
  llmDriven: true,
  llmCallsPerTask: "3 + memory ops",
  keyDifferentiator: "Dual persistent memory: episodic (conversation summaries in FAISS vector store) + semantic (structured facts in Neo4j graph). Both survive across sessions.",
  color: "#f59e0b",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "retrieve", type: "memory", label: "Retrieve\nMemory", x: 250, y: 110, description: "Queries both FAISS (similarity search) and Neo4j (Cypher) with the current input" },
    { id: "generate", type: "llm", label: "Generate\nResponse", x: 250, y: 230, description: "Answers using current input + retrieved memory context" },
    { id: "update", type: "memory", label: "Update\nMemory", x: 250, y: 350, description: "Summarizes turn into FAISS; extracts entities/relations into Neo4j" },
    { id: "end", type: "end", label: "END", x: 250, y: 450 },
  ],
  edges: [
    { id: "e1", source: "start", target: "retrieve" },
    { id: "e2", source: "retrieve", target: "generate" },
    { id: "e3", source: "generate", target: "update" },
    { id: "e4", source: "update", target: "end" },
  ],
  demoInput: "Turn 3: 'Based on my investment goals, what's a good alternative to Tesla?'",
  demoOutput: "Based on your profile — conservative risk tolerance and interest in tech — I'd suggest Microsoft (MSFT). It has a more stable revenue base than Tesla, strong cloud growth via Azure, and consistent dividends that fit your conservative approach.",
  executionTrace: [
    {
      activeNodeId: "retrieve",
      label: "Step 1 — Retrieve from both stores",
      stateSnapshot: { user_input: "Based on my goals, what's a good alternative to Tesla?", retrieved_memories: null },
      explanation: "FAISS similarity search finds past turns about Alex's investment goals. Neo4j Cypher query finds: (Alex)-[HAS_GOAL]->(Conservative Investing), (Alex)-[INTERESTED_IN]->(Tech).",
    },
    {
      activeNodeId: "generate",
      label: "Step 2 — Generate with memory context",
      stateSnapshot: {
        user_input: "Based on my goals, what's a good alternative?",
        retrieved_memories: {
          episodic: ["Turn 1: Alex mentioned conservative risk tolerance", "Turn 2: Alex interested in tech sector"],
          semantic: ["(Alex)-[HAS_GOAL]->(Conservative Investing)", "(Alex)-[INTERESTED_IN]->(Tech)"],
        },
      },
      explanation: "LLM sees the user's question PLUS the retrieved memory. It knows Alex is conservative and tech-focused, so recommends MSFT over speculative tech picks.",
    },
    {
      activeNodeId: "update",
      label: "Step 3 — Update both memory stores",
      stateSnapshot: { generation: "Based on your conservative profile, MSFT is a good fit..." },
      explanation: "Episodic: summarizes this turn into a sentence, embeds it into FAISS. Semantic: extracts (Alex)-[CONSIDERING]->(MSFT) relationship and writes it to Neo4j.",
    },
  ],
  codeSnippets: {
    retrieve: `def retrieve_memory(state: AgentState):
    # Episodic: vector similarity search
    episodic_docs = faiss_store.similarity_search(state["user_input"], k=3)

    # Semantic: structured Cypher query
    cypher = f"""MATCH (u:User {{name: 'Alex'}})-[r]->(e)
RETURN u.name, type(r), e.name"""
    semantic_facts = graph.query(cypher)

    return {"retrieved_memories": {
        "episodic": [d.page_content for d in episodic_docs],
        "semantic": semantic_facts
    }}`,
    update: `class KnowledgeGraph(BaseModel):
    relationships: List[Relationship]  # (subject, predicate, object) triples

def create_memories(state: AgentState):
    # Episodic: summarize turn into one sentence → embed → store
    summary = llm.invoke(f"Summarize in one sentence: {state['user_input']}")
    faiss_store.add_texts([summary.content])

    # Semantic: extract structured facts → write to Neo4j
    kg = llm.with_structured_output(KnowledgeGraph).invoke(
        f"Extract facts about the user from: {state['user_input']}"
    )
    graph.add_graph_documents([...kg.relationships])`,
  },
};
