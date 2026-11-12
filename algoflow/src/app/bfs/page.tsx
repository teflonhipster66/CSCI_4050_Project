"use client";

import { useEffect, useState } from "react";
import { initializeBFS, stepBFS, type BFSGraph, type BFSState } from "@/algorithms/bfs";
import GraphVisualizer, { type GraphVisualizerNode } from "@/components/graph-visualizer";
import { BoardHeader, Facts } from "@/components/study-ui";

const graph: BFSGraph = {
  A: ["B", "C"], B: ["A", "D"], C: ["A", "D", "F"],
  D: ["B", "C", "E"], E: ["D", "F"], F: ["C", "E"],
};
const layout = [
  { id: "A", position: { x: 90, y: 192 } },
  { id: "B", position: { x: 228, y: 72 } },
  { id: "C", position: { x: 252, y: 280 } },
  { id: "D", position: { x: 408, y: 128 } },
  { id: "E", position: { x: 504, y: 272 } },
  { id: "F", position: { x: 390, y: 352 } },
];
const edgePairs = [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["C", "F"], ["D", "E"], ["E", "F"]];

function advanceHistory(history: BFSState[]): BFSState[] {
  const current = history[history.length - 1];
  return current.complete ? history : [...history, stepBFS(graph, current)];
}

export default function BFSPage() {
  const [source, setSource] = useState("A");
  const [history, setHistory] = useState(() => [initializeBFS(graph, "A")]);
  const state = history[history.length - 1];
  const [autoRunning, setAutoRunning] = useState(false);
  const running = autoRunning && !state.complete;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setHistory(advanceHistory), 1000);
    return () => window.clearTimeout(timer);
  }, [running, state]);

  function reset(nextSource = source) {
    setAutoRunning(false);
    setSource(nextSource);
    setHistory([initializeBFS(graph, nextSource)]);
  }

  function previousStep() {
    setAutoRunning(false);
    setHistory(previous => previous.length > 1 ? previous.slice(0, -1) : previous);
  }

  const nodes: GraphVisualizerNode[] = layout.map(node => ({
    ...node, label: node.id, state: state.vertices[node.id].color,
    caption: state.current === node.id ? "current node" : state.vertices[node.id].color,
  }));
  const edges = edgePairs.map(([from, to]) => {
    const unchecked = state.current !== null && (
      (from === state.current && graph[from].indexOf(to) >= state.neighborIndex) ||
      (to === state.current && graph[to].indexOf(from) >= state.neighborIndex)
    );
    return {
      id: `${from}-${to}`, source: from, target: to,
      highlighted: unchecked,
      animated: unchecked,
    };
  });
  const finishedCount = Object.values(state.vertices).filter(vertex => vertex.color === "black").length;

  return (
    <div className="page-grid">
      <section className="heap-board board-graph">
        <div className="tape tape-left" />
        <BoardHeader step="BREADTH-FIRST SEARCH" title={!state.initialized ? `Add ${source} to the queue` : state.complete ? "BFS complete!" : state.current ? `Explore ${state.current}'s neighbors` : "Dequeue the front of the queue"} progress={`${finishedCount}/${layout.length}`} />
        <div className="instruction-note blue-note">
          <span className="note-arrow">↳</span>
          <p>White = undiscovered. Gray = discovered, still being explored. Black = all neighbors checked. Follow FIFO queue order; break distance ties alphabetically.</p>
        </div>
        <div className="heap-step-controls bfs-step-controls">
          <label htmlFor="bfs-source">Start vertex: {" "}
            <select id="bfs-source" value={source} onChange={event => reset(event.target.value)}>
              {layout.map(node => <option key={node.id} value={node.id}>{node.id}</option>)}
            </select>
          </label>
          <div className="heap-step-actions">
            <button type="button" className="heap-control-button" onClick={() => reset()}>Reset</button>
            <button type="button" className="heap-control-button" disabled={state.complete} aria-pressed={running} onClick={() => setAutoRunning(value => !value)}>{running ? "Pause" : "Auto BFS"}</button>
            <button type="button" className="heap-control-button" disabled={history.length <= 1} onClick={previousStep}>Previous step</button>
            <button type="button" className="heap-control-button primary-control" disabled={running || state.complete} onClick={() => setHistory(advanceHistory)}>Next step</button>
          </div>
        </div>
        <GraphVisualizer nodes={nodes} edges={edges} height={400} ariaLabel="Breadth-first search graph with white, gray, and black vertices" />
        <p className="heap-feedback" aria-live="polite">{state.message}</p>
        <div className="queue-strip" aria-label="BFS queue, front to back">
          <div className="array-label"><span>front</span><strong>the queue</strong></div>
          <span className="queue-arrow">→</span>
          {state.queue.length === 0 ? <span>Empty</span> : state.queue.map((id, index) => (
            <div className={index === 0 ? "queue-next" : ""} key={id}><strong>{id}</strong><small>{index === 0 ? "next" : "waiting"}</small></div>
          ))}
          <span className="queue-end">back →</span>
        </div>
        <p>Dequeue order: {state.order.join(" → ") || "None yet"}</p>
        <table className="bfs-table">
          <caption>Vertex state (d = distance from source ({source}); π = predecessor)</caption>
          <thead><tr><th scope="col">Vertex</th><th scope="col">Color</th><th scope="col">d</th><th scope="col">π</th><th scope="col">Neighbors</th></tr></thead>
          <tbody>{layout.map(({ id }) => {
            const vertex = state.vertices[id];
            return <tr key={id}><th scope="row">{id}</th><td>{vertex.color}</td><td>{vertex.distance === Infinity ? "∞" : vertex.distance}</td><td>{vertex.parent ?? "NIL"}</td><td>{graph[id].join(", ")}</td></tr>;
          })}</tbody>
        </table>
      </section>
      <Facts topic="bfs" />
    </div>
  );
}
