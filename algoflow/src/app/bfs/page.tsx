"use client";

import { useEffect, useMemo, useState } from "react";
import { initializeBFS, stepBFS, type BFSGraph, type BFSState } from "@/algorithms/bfs";
import GraphVisualizer, { type GraphVisualizerNode } from "@/components/graph-visualizer";
import { PredictionToggle } from "@/components/prediction-toggle";
import { BoardHeader, Facts, PredictionNote } from "@/components/study-ui";
import { useStudyAudio } from "@/components/use-study-audio";

function createGraph(nodeCount: number, edgeCount: number, edgeOrder: [string, string][] | null = null) {
  const ids = Array.from({ length: nodeCount }, (_, index) => String.fromCharCode(65 + index));
  const graph: Record<string, string[]> = Object.fromEntries(ids.map(id => [id, []]));
  // Add a chain first so graphs with at least n - 1 edges are connected.
  const pairs: [string, string][] = [];
  for (let index = 1; index < ids.length; index++) pairs.push([ids[index - 1], ids[index]]);
  for (let from = 0; from < ids.length; from++) {
    for (let to = from + 2; to < ids.length; to++) pairs.push([ids[from], ids[to]]);
  }
  const edgePairs = (edgeOrder ?? pairs).slice(0, edgeCount);
  for (const [from, to] of edgePairs) {
    graph[from].push(to);
    graph[to].push(from);
  }
  for (const neighbors of Object.values(graph)) neighbors.sort();
  const layout = ids.map((id, index) => {
    const angle = (2 * Math.PI * index) / nodeCount - Math.PI / 2;
    return { id, position: { x: 280 + 230 * Math.cos(angle), y: 165 + 145 * Math.sin(angle) } };
  });
  return { graph, edgePairs, layout };
}

function advanceHistory(graph: BFSGraph, history: BFSState[]): BFSState[] {
  const current = history[history.length - 1];
  return current.complete ? history : [...history, stepBFS(graph, current)];
}

export default function BFSPage() {
  const [nodeCount, setNodeCount] = useState(6);
  const [edgeCount, setEdgeCount] = useState(7);
  const [randomizedPairs, setRandomizedPairs] = useState<[string, string][] | null>(null);
  const maxEdges = nodeCount * (nodeCount - 1) / 2;
  const { graph, edgePairs, layout } = useMemo(() => createGraph(nodeCount, edgeCount, randomizedPairs), [nodeCount, edgeCount, randomizedPairs]);
  const [source, setSource] = useState("A");
  const [history, setHistory] = useState(() => [initializeBFS(graph, "A")]);
  const state = history[history.length - 1];
  const [autoRunning, setAutoRunning] = useState(false);
  const [predictionMode, setPredictionMode] = useState(false);
  const [predictionFeedback, setPredictionFeedback] = useState<{ step: BFSState; message: string } | null>(null);
  const { playSelectionSound } = useStudyAudio();
  const remainingNeighbors = state.current === null ? [] : graph[state.current].slice(state.neighborIndex);
  const nextNeighbor = remainingNeighbors[0];
  const awaitingPrediction = predictionMode && nextNeighbor !== undefined && state.vertices[nextNeighbor].color === "white";
  const candidates = awaitingPrediction ? remainingNeighbors.filter(id => state.vertices[id].color === "white") : [];
  const running = autoRunning && !state.complete;

  useEffect(() => {
    if (!running || awaitingPrediction) return;
    const timer = window.setTimeout(() => {
      setHistory(previous => previous.at(-1) === state ? advanceHistory(graph, previous) : previous);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [running, awaitingPrediction, state, graph]);

  function reset(nextSource = source) {
    setAutoRunning(false);
    setSource(nextSource);
    setHistory([initializeBFS(graph, nextSource)]);
  }

  function updateGraph(nextNodeCount: number, requestedEdges: number, randomize = randomizedPairs !== null) {
    const nextEdgeCount = Math.min(requestedEdges, nextNodeCount * (nextNodeCount - 1) / 2);
    let nextPairs: [string, string][] | null = null;
    if (randomize) {
      nextPairs = createGraph(nextNodeCount, nextNodeCount * (nextNodeCount - 1) / 2).edgePairs;
      for (let index = nextPairs.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [nextPairs[index], nextPairs[other]] = [nextPairs[other], nextPairs[index]];
      }
    }
    const nextGraph = createGraph(nextNodeCount, nextEdgeCount, nextPairs).graph;
    const nextSource = Object.hasOwn(nextGraph, source) ? source : "A";
    setAutoRunning(false);
    setNodeCount(nextNodeCount);
    setEdgeCount(nextEdgeCount);
    setRandomizedPairs(nextPairs);
    setSource(nextSource);
    setHistory([initializeBFS(nextGraph, nextSource)]);
  }

  function previousStep() {
    setAutoRunning(false);
    setPredictionFeedback(null);
    setHistory(previous => previous.length > 1 ? previous.slice(0, -1) : previous);
  }

  function predictNode(id: string) {
    if (!candidates.includes(id)) return;
    if (id !== nextNeighbor) {
      setPredictionFeedback({ step: state, message: `Try again. ${id} can be discovered, but another neighbor comes first alphabetically.` });
      return;
    }
    const nextState = stepBFS(graph, state);
    playSelectionSound(true);
    setPredictionFeedback({ step: nextState, message: `Correct! ${nextState.message}` });
    setHistory(previous => previous.at(-1) === state ? [...previous, nextState] : previous);
  }

  const nodes: GraphVisualizerNode[] = layout.map(node => {
    const isCandidate = candidates.includes(node.id);
    const color = state.vertices[node.id].color;
    return {
      ...node, label: node.id, state: isCandidate ? "candidate" : color,
      caption: isCandidate ? "candidate" : state.current === node.id ? "current node" : color,
      clickable: isCandidate,
    };
  });
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
  const title = !state.initialized ? `Add ${source} to the queue`
    : state.complete ? "BFS complete!"
    : state.current ? `Explore ${state.current}'s neighbors` : "Dequeue the front of the queue";

  return (
    <div className="page-grid">
      <section className="heap-board board-graph">
        <div className="tape tape-left" />
        <BoardHeader step="BREADTH-FIRST SEARCH" title={title} progress={`${finishedCount}/${layout.length}`} />
        <PredictionNote
          awaitingPrediction={awaitingPrediction}
          instructions="White = undiscovered. Gray = discovered, still being explored. Black = all neighbors checked. Follow FIFO queue order and check each vertex’s neighbors alphabetically."
        />
        <div className="heap-step-controls bfs-step-controls">
          <label htmlFor="bfs-source">Start vertex: {" "}
            <select id="bfs-source" value={source} onChange={event => reset(event.target.value)}>
              {layout.map(node => <option key={node.id} value={node.id}>{node.id}</option>)}
            </select>
          </label>
          <div className="heap-input-row bfs-graph-sliders">
            <div className="bfs-slider">
              <label htmlFor="bfs-node-count">Nodes: {nodeCount}</label>
              <input id="bfs-node-count" className="heap-range-slider" type="range" min={1} max={10} step={1} value={nodeCount} onChange={event => updateGraph(Number(event.target.value), edgeCount)} />
            </div>
            <div className="bfs-slider">
              <label htmlFor="bfs-edge-count">Edges: {edgeCount} / {maxEdges}</label>
              <input id="bfs-edge-count" className="heap-range-slider" type="range" min={0} max={maxEdges} step={1} value={edgeCount} disabled={maxEdges === 0} onChange={event => updateGraph(nodeCount, Number(event.target.value))} />
            </div>
          </div>
          <div className="heap-step-actions bfs-edge-controls">
            <button type="button" className="heap-control-button" disabled={edgeCount === 0 || edgeCount === maxEdges} onClick={() => updateGraph(nodeCount, edgeCount, true)}>Randomize edges</button>
            <button type="button" className="heap-control-button" disabled={randomizedPairs === null} onClick={() => updateGraph(nodeCount, edgeCount, false)}>Default edges</button>
          </div>
        </div>
        <GraphVisualizer nodes={nodes} edges={edges} directEdges height={400} ariaLabel="Breadth-first search graph" onNodeClick={awaitingPrediction ? predictNode : undefined} />
        <div className="bfs-playback-row">
          <p className="heap-feedback" aria-live="polite">{predictionFeedback?.step === state ? predictionFeedback.message : state.message}</p>
          <div className="heap-step-actions bfs-playback-controls">
            <PredictionToggle enabled={predictionMode} onToggle={() => {
              setPredictionFeedback(null);
              setPredictionMode(value => !value);
            }} />
            <button type="button" className="heap-control-button" onClick={() => reset()}>Reset</button>
            <button type="button" className="heap-control-button" disabled={state.complete} aria-pressed={running} onClick={() => setAutoRunning(value => !value)}>{running ? "Pause" : "Auto BFS"}</button>
            <button type="button" className="heap-control-button" disabled={history.length <= 1} onClick={previousStep}>Previous step</button>
            <button type="button" className="heap-control-button primary-control" disabled={running || state.complete || awaitingPrediction} onClick={() => setHistory(previous => advanceHistory(graph, previous))}>Next step</button>
          </div>
        </div>
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
