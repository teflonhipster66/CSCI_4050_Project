import GraphVisualizer, { type GraphVisualizerNode } from "@/components/graph-visualizer";
import { BoardHeader, Facts } from "@/components/study-ui";

const graphNodes: GraphVisualizerNode[] = [
  { id: "A", label: "A", position: { x: 90, y: 192 }, state: "visited" },
  { id: "B", label: "B", position: { x: 228, y: 72 }, state: "visited" },
  { id: "C", label: "C", position: { x: 252, y: 280 }, state: "candidate" },
  { id: "D", label: "D", position: { x: 408, y: 128 }, state: "queued" },
  { id: "E", label: "E", position: { x: 504, y: 272 }, state: "unseen" },
  { id: "F", label: "F", position: { x: 390, y: 352 }, state: "unseen" },
];

export default function BFSPage() {
  const edges = [[0,1],[0,2],[1,3],[2,3],[2,5],[3,4],[4,5]];
  return (
    <div className="page-grid">
      <section className="heap-board board-graph"><div className="tape tape-left" />
      <BoardHeader step="STEP 3 OF 6" title="Who leaves the queue next?" progress="3/6" />
      <div className="instruction-note blue-note"><span className="note-arrow">↳</span><p>We visited A, then B. Use FIFO order to choose the next node in the queue.</p></div>
      <GraphVisualizer
        nodes={graphNodes}
        edges={edges.map(([from, to]) => ({
          id: `${graphNodes[from].id}-${graphNodes[to].id}`,
          source: graphNodes[from].id,
          target: graphNodes[to].id,
        }))}
        ariaLabel="Breadth-first graph traversal diagram"
      />
      <div className="queue-strip">
        <div className="array-label"><span>front</span><strong>the queue</strong></div>
        <span className="queue-arrow">→</span>
        {["C", "D", "E"].map((letter, index) => <div className={index === 0 ? "queue-next" : ""} key={letter}><strong>{letter}</strong><small>{index === 0 ? "next" : "waiting"}</small></div>)}
        <span className="queue-end">back →</span>
      </div>
      </section>
      <Facts topic="bfs" />
    </div>
  );
}

