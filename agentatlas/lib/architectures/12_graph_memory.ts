import { Architecture } from "../types";

export const graphMemory: Architecture = {
  id: "graph-memory",
  number: 12,
  name: "Graph / World-Model Memory",
  part: 3,
  tagline: "Text-to-Cypher: multi-hop reasoning over a knowledge graph",
  controlFlow: "linear",
  loopType: "none",
  memoryType: "neo4j",
  toolUse: false,
  llmDriven: true,
  llmCallsPerTask: "2 (Text→Cypher + Cypher→Answer)",
  keyDifferentiator: "Uses Neo4j as the primary reasoning substrate — not supplementary memory. Text-to-Cypher enables 4-hop graph traversal that standard RAG vector search cannot support.",
  color: "#f59e0b",
  paradigm: "deliberative",
  conceptualInsight: "Graph traversal is reasoning you can audit. When you ask 'what companies compete with the acquirer of BetaSolutions?', that's a 4-hop chain: BetaSolutions → acquired_by → AlphaCorp → makes → product → competes_with → Innovate Inc. Vector search finds similar documents; graphs traverse relationships. The query IS the reasoning path.",
  whenToUse: [
    { useCase: "Multi-hop relationship queries across documents", reason: "4-hop traversal (A→B→C→D) is a single Cypher MATCH — no chunking, no re-ranking, no lost connections." },
    { useCase: "Knowledge bases with structured entity relationships", reason: "If your domain has named entities with typed relationships (owns, employs, competes, etc.), a graph is the natural query substrate." },
    { useCase: "Audit-required question answering", reason: "The Cypher query is the explicit reasoning path — every hop is inspectable, unlike attention weights in a vector search." },
  ],
  strengths: [
    "Multi-hop reasoning is native — no prompt engineering required",
    "Relationships are first-class: typed, directed, queryable",
    "Transparent reasoning path (the Cypher query itself)",
    "Scales to large knowledge bases without degrading on complex queries",
  ],
  weaknesses: [
    "Ingest step is expensive: every document must be parsed into triples",
    "LLM Text-to-Cypher quality degrades on complex schemas",
    "Schema drift: adding new entity types requires schema updates",
    "No fuzzy matching — exact entity names required (unlike vector search)",
  ],
  comparedTo: [
    { name: "Episodic + Semantic Memory", insight: "Graph Memory uses Neo4j as the primary reasoning substrate for multi-hop traversal; Episodic+Semantic uses Neo4j for structured facts alongside FAISS for fuzzy similarity search." },
    { name: "ReAct", insight: "Both can answer multi-hop questions — ReAct loops through web searches; Graph Memory does it in one Cypher query over pre-ingested data." },
  ],
  nodes: [
    { id: "start",     type: "start",      label: "START",              x: 200, y: 20 },
    { id: "ingest",    type: "a2decision", label: "Graph\nMaker Agent", x: 200, y: 160, description: "A2 (Decision): LLM parses documents and extracts entity-relation triples into Neo4j" },
    { id: "cypher_gen",type: "a2decision", label: "Cypher\nGenerator",  x: 200, y: 300, description: "A2 (Decision): translates natural language query into a Cypher graph query" },
    { id: "execute",   type: "a3memory",   label: "Neo4j\nTraversal",   x: 440, y: 300, description: "A3 (Memory): executes Cypher against the knowledge graph, returns raw traversal results" },
    { id: "synthesize",type: "a2decision", label: "Answer\nSynthesizer", x: 200, y: 440, description: "A2 (Decision): converts raw Cypher results into a natural language answer" },
    { id: "end",       type: "end",        label: "END",                x: 200, y: 560 },
  ],
  edges: [
    { id: "e1", source: "start",      target: "ingest" },
    { id: "e2", source: "ingest",     target: "cypher_gen" },
    { id: "e3", source: "cypher_gen", target: "execute" },
    { id: "e4", source: "execute",    target: "synthesize" },
    { id: "e5", source: "synthesize", target: "end" },
  ],
  demoInput: "What companies compete with products made by the company that acquired BetaSolutions?",
  demoOutput: "Innovate Inc. competes with AlphaCorp's products. This was discovered via a 4-hop graph traversal: BetaSolutions ← ACQUIRED_BY — AlphaCorp — MAKES → AlphaCorp_Product ← COMPETES_WITH — Innovate Inc.",
  executionTrace: [
    {
      activeNodeId: "ingest",
      label: "Step 1 — Ingest documents into Neo4j",
      stateSnapshot: {
        documents: [
          "AlphaCorp acquired BetaSolutions for $50M",
          "Dr. Reed is CSO at AlphaCorp",
          "Innovate Inc. competes with AlphaCorp's product line",
        ],
      },
      explanation: "Graph Maker extracts triples: (AlphaCorp)-[ACQUIRED]->(BetaSolutions), (Dr.Reed)-[IS_CSO_AT]->(AlphaCorp), (InnovateInc)-[COMPETES_WITH]->(AlphaCorp_Product). Written to Neo4j.",
    },
    {
      activeNodeId: "cypher_gen",
      label: "Step 2 — Translate question to Cypher",
      stateSnapshot: { query: "What companies compete with products made by the company that acquired BetaSolutions?", schema: "(AlphaCorp)-[ACQUIRED]->(BetaSolutions), (AlphaCorp)-[MAKES]->(Product), (Company)-[COMPETES_WITH]->(Product)" },
      explanation: "LLM generates Cypher:\nMATCH (c)-[:ACQUIRED]->(b {name:'BetaSolutions'})\nMATCH (c)-[:MAKES]->(p)\nMATCH (comp)-[:COMPETES_WITH]->(p)\nRETURN comp.name",
    },
    {
      activeNodeId: "execute",
      label: "Step 3 — Execute Cypher on Neo4j",
      stateSnapshot: { cypher: "MATCH (c)-[:ACQUIRED]->(b {name:'BetaSolutions'})..." },
      explanation: "Neo4j traverses 4 hops: BetaSolutions → AlphaCorp → Products → Competitors. Returns: [{comp.name: 'Innovate Inc.'}]. Standard vector search would miss this multi-hop connection.",
    },
    {
      activeNodeId: "synthesize",
      label: "Step 4 — Synthesize natural language answer",
      stateSnapshot: { cypher_results: [{ "comp.name": "Innovate Inc." }] },
      explanation: "Synthesizer receives the raw Cypher result and converts it to a human-readable explanation of the 4-hop reasoning chain.",
    },
  ],
  codeSnippets: {
    ingest: `class KnowledgeGraph(BaseModel):
    relationships: List[Relationship]

graph_maker_agent = (
    ChatPromptTemplate.from_messages([
        ("system", "Extract all entities and relationships from the text."),
        ("human", "{text}")
    ])
    | llm.with_structured_output(KnowledgeGraph)
)

for doc in documents:
    kg = graph_maker_agent.invoke({"text": doc})
    graph.add_graph_documents([...kg.relationships])`,
    cypher_gen: `def query_graph(question: str) -> str:
    schema = graph.get_schema  # Neo4j schema introspection

    # Step 1: NL → Cypher
    cypher = (cypher_generation_prompt | llm).invoke({
        "schema": schema,
        "question": question
    }).content

    # Step 2: Execute
    results = graph.query(cypher)

    # Step 3: Cypher results → NL
    answer = (cypher_response_prompt | llm).invoke({
        "question": question,
        "results": results
    }).content
    return answer`,
  },
};
