"use client";

import { useState } from "react";

type Topic = "heap" | "graph" | "knapsack";

const heap = [92, 71, 84, 46, 63, 58, 77, 18, 32, 41];
const heapPositions = [[50, 8], [27, 31], [73, 31], [14, 56], [39, 56], [61, 56], [86, 56], [7, 82], [21, 82], [33, 82]];
const graphNodes = [
  { label: "A", x: 15, y: 48, state: "visited" },
  { label: "B", x: 38, y: 18, state: "visited" },
  { label: "C", x: 42, y: 70, state: "candidate" },
  { label: "D", x: 68, y: 32, state: "queued" },
  { label: "E", x: 84, y: 68, state: "" },
  { label: "F", x: 65, y: 88, state: "" },
];

function Icon({ name, size = 18 }: { name: "grid" | "book" | "chart" | "settings" | "refresh" | "shuffle" | "arrow" | "bulb" | "clock" | "box"; size?: number }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 1-.15 1.45l2 1.55-2 3.45-2.5-1A7 7 0 0 1 14 18.8L13.6 21h-4L9 18.8a7 7 0 0 1-2.35-1.35l-2.5 1-2-3.45 2-1.55A7 7 0 0 1 4 12c0-.5.05-.98.15-1.45L2.15 9l2-3.45 2.5 1A7 7 0 0 1 9 5.2L9.6 3h4l.4 2.2a7 7 0 0 1 2.35 1.35l2.5-1 2 3.45-2 1.55c.1.47.15.95.15 1.45Z"/></>,
    refresh: <><path d="M20 11a8 8 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8 8 0 0 0 15.5 2M20 20v-5h-5"/></>,
    shuffle: <><path d="M16 3h5v5"/><path d="m4 20 17-17"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    bulb: <><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.6-1.2 1.4-1.2 2.5H9.7c0-1.1-.4-1.9-1.2-2.5Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    box: <><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="m3 7 9 4 9-4"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const topicCopy = {
  heap: { category: "SORTING", title: "Heap sort", accent: "step by step", description: "Follow the values through the tree. Pick the node that should move next." },
  graph: { category: "GRAPHS", title: "Breadth-first search", accent: "layer by layer", description: "Trace the queue and choose which neighboring node should be visited next." },
  knapsack: { category: "DYNAMIC PROGRAMMING", title: "0/1 Knapsack", accent: "cell by cell", description: "Build the answer from smaller decisions instead of trying every combination." },
};

function HeapBoard() {
  return (
    <>
      <BoardHeader step="STEP 2 OF 7" title="Which node moves up?" progress="2/7" />
      <div className="instruction-note"><span className="note-arrow">↳</span><p>The root has been removed. Compare the two children and choose the larger one.</p></div>
      <div className="heap-tree" aria-label="Binary max heap diagram">
        <svg className="heap-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {heapPositions.slice(1).map(([x, y], index) => {
            const parent = heapPositions[Math.floor(index / 2)];
            return <path key={index} d={`M ${parent[0]} ${parent[1]} Q ${(parent[0] + x) / 2 + (index % 2 ? 1 : -1)} ${(parent[1] + y) / 2} ${x} ${y}`} />;
          })}
        </svg>
        {heap.map((value, index) => {
          const [x, y] = heapPositions[index];
          return <button key={index} className={`heap-node ${index === 0 ? "empty-node" : ""} ${index === 2 ? "candidate-node" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} aria-label={`Node value ${value}`}>
            {index === 0 ? <span>?</span> : <strong>{value}</strong>}<small>{index === 0 ? "root" : `i=${index}`}</small>
          </button>;
        })}
        <PencilCallout text="pick one!" left="72%" top="13%" />
      </div>
      <div className="array-strip">
        <div className="array-label"><span>same heap,</span><strong>as an array</strong></div>
        <div className="array-values">{heap.map((value, index) => <div key={index} className={index === 0 ? "array-empty" : index === 2 ? "array-candidate" : ""}><strong>{index === 0 ? "—" : value}</strong><small>{index}</small></div>)}</div>
      </div>
    </>
  );
}

function GraphBoard() {
  const edges = [[0,1],[0,2],[1,3],[2,3],[2,5],[3,4],[4,5]];
  return (
    <>
      <BoardHeader step="STEP 3 OF 6" title="Who leaves the queue next?" progress="3/6" />
      <div className="instruction-note blue-note"><span className="note-arrow">↳</span><p>We visited A, then B. Use FIFO order to choose the next node in the queue.</p></div>
      <div className="graph-canvas" aria-label="Breadth-first graph traversal diagram">
        <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map(([from, to], index) => <path key={index} d={`M ${graphNodes[from].x} ${graphNodes[from].y} Q ${(graphNodes[from].x + graphNodes[to].x) / 2 + (index % 2 ? 2 : -2)} ${(graphNodes[from].y + graphNodes[to].y) / 2} ${graphNodes[to].x} ${graphNodes[to].y}`} />)}
        </svg>
        {graphNodes.map((node) => <button key={node.label} className={`graph-node ${node.state}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}><strong>{node.label}</strong><small>{node.state || "unseen"}</small></button>)}
        <PencilCallout text="next out?" left="50%" top="60%" />
      </div>
      <div className="queue-strip">
        <div className="array-label"><span>front</span><strong>the queue</strong></div>
        <span className="queue-arrow">→</span>
        {["C", "D", "E"].map((letter, index) => <div className={index === 0 ? "queue-next" : ""} key={letter}><strong>{letter}</strong><small>{index === 0 ? "next" : "waiting"}</small></div>)}
        <span className="queue-end">back →</span>
      </div>
    </>
  );
}

function KnapsackBoard() {
  const cells = [
    [0,0,0,0,0,0],[0,0,3,3,3,3],[0,0,3,4,4,7],[0,0,3,4,5,7],
  ];
  return (
    <>
      <BoardHeader step="CELL 3,4 OF 18" title="Take it or leave it?" progress="11/18" />
      <div className="instruction-note green-note"><span className="note-arrow">↳</span><p>For the 5-value item, compare skipping it with taking it and using the space left over.</p></div>
      <div className="dp-workspace">
        <div className="item-notes">
          <div><span>item 1</span><strong>2 kg · $3</strong></div>
          <div><span>item 2</span><strong>3 kg · $4</strong></div>
          <div className="active-item"><span>item 3</span><strong>4 kg · $5</strong></div>
        </div>
        <div className="dp-table">
          <div className="corner-cell">kg →</div>{[0,1,2,3,4,5].map(n => <div className="table-head" key={n}>{n}</div>)}
          {cells.map((row, rowIndex) => <div className="contents-row" key={rowIndex}><div className="table-head">{rowIndex}</div>{row.map((value, colIndex) => <button className={rowIndex === 3 && colIndex === 4 ? "current-cell" : rowIndex < 3 ? "solved-cell" : ""} key={colIndex}>{rowIndex === 3 && colIndex === 4 ? "?" : value}</button>)}</div>)}
        </div>
        <div className="formula-note"><span>best of:</span><strong>4</strong><i>skip it</i><b>or</b><strong>5 + 0</strong><i>take it</i></div>
      </div>
      <div className="knapsack-strip"><span>capacity</span><strong>4 kg</strong><div className="bag-sketch">⌒</div><p>Every cell asks the same tiny question: <em>take it or leave it?</em></p></div>
    </>
  );
}

function BoardHeader({ step, title, progress }: { step: string; title: string; progress: string }) {
  return <div className="board-header"><div><span className="step-label">{step}</span><h2>{title}</h2></div><div className="progress-doodle"><span>{progress}</span><svg viewBox="0 0 104 16" aria-hidden="true"><path d="M2 8c24 2 64-3 100 0"/><path className="progress-ink" d="M2 8c14 1 22-2 31 0"/></svg></div></div>;
}

function PencilCallout({ text, left, top }: { text: string; left: string; top: string }) {
  return <div className="pencil-callout" style={{ left, top }}><span>{text}</span><svg viewBox="0 0 64 42" aria-hidden="true"><path d="M60 2C40 5 20 9 8 33"/><path d="m4 26 4 8 8-3"/></svg></div>;
}

function Facts({ topic }: { topic: Topic }) {
  const content = {
    heap: { big: "A max heap only promises that every parent is larger than its children.", note: "not fully sorted!", time: "O(n log n)", timeCopy: "Building is O(n). Each extraction takes O(log n).", space: "O(1)", spaceCopy: "Heap sort works in place — no extra array needed.", rule: <>For a node at index <i>i</i>:</>, rows: [["left child","2i + 1"],["right child","2i + 2"]] },
    graph: { big: "BFS explores a graph one whole layer at a time, starting from the source.", note: "think ripples!", time: "O(V + E)", timeCopy: "Every vertex and every edge is considered once.", space: "O(V)", spaceCopy: "The queue may hold an entire layer of vertices.", rule: <>The queue is <i>FIFO</i>:</>, rows: [["add nodes","at the back"],["visit nodes","from the front"]] },
    knapsack: { big: "Each cell stores the best value possible for one item limit and capacity.", note: "reuse answers!", time: "O(n · W)", timeCopy: "Solve one cell per item for every capacity.", space: "O(n · W)", spaceCopy: "A full table makes each earlier decision visible.", rule: <>For every item, compare:</>, rows: [["skip it","row above"],["take it","value + leftover"]] },
  }[topic];
  return (
    <aside className="facts-column">
      <div className="fact-heading"><span>THE CHEAT SHEET</span><h2>Good to know</h2><svg viewBox="0 0 130 12" aria-hidden="true"><path d="M2 7c38-5 85 4 126-2" /></svg></div>
      <article className="fact-card yellow-card"><div className="fact-icon"><Icon name="bulb" size={19} /></div><span>THE BIG IDEA</span><p>{content.big}</p><div className="margin-note">{content.note}</div></article>
      <article className="fact-card"><div className="fact-row"><div className="fact-icon purple"><Icon name="clock" size={18} /></div><div><span>TIME COMPLEXITY</span><strong>{content.time}</strong></div></div><p>{content.timeCopy}</p></article>
      <article className="fact-card"><div className="fact-row"><div className="fact-icon coral"><Icon name="box" size={18} /></div><div><span>SPACE COMPLEXITY</span><strong>{content.space}</strong></div></div><p>{content.spaceCopy}</p></article>
      <article className="rule-card"><span>QUICK RULE</span><h3>{content.rule}</h3>{content.rows.map(([label, value]) => <div key={label}><p>{label}</p><strong>{value}</strong></div>)}<div className="scribble-star">✦</div></article>
      <button className="next-button">See the next step <Icon name="arrow" /></button>
    </aside>
  );
}

export default function App() {
  const [topic, setTopic] = useState<Topic>("heap");
  const copy = topicCopy[topic];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-sketch"><span /><span /><span /></div><span>AlgoFlow</span></div>
        <nav className="nav-list" aria-label="Study topics">
          <button className={`nav-item ${topic === "heap" ? "active" : ""}`} onClick={() => setTopic("heap")}><Icon name="grid" />Heap sort</button>
          <button className={`nav-item ${topic === "graph" ? "active" : ""}`} onClick={() => setTopic("graph")}><Icon name="chart" />Graph traversal</button>
          <button className={`nav-item ${topic === "knapsack" ? "active" : ""}`} onClick={() => setTopic("knapsack")}><Icon name="book" />0/1 Knapsack</button>
        </nav>
        <div className="chapter-list"><p>In this drill</p><div className="chapter done"><span>✓</span><div><strong>Learn the shape</strong><small>Complete</small></div></div><div className="chapter current"><span>2</span><div><strong>Make the choice</strong><small>You are here</small></div></div><div className="chapter"><span>3</span><div><strong>Spot the pattern</strong><small>Up next</small></div></div></div>
        <div className="sidebar-note"><span>Remember</span><p>Understand the move.<br />Don’t memorize it.</p><svg viewBox="0 0 120 18" aria-hidden="true"><path d="M2 11c18-6 38 4 58-1s40 3 58-2" /></svg></div>
        <button className="nav-item settings"><Icon name="settings" />Settings</button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><div className="breadcrumb">{copy.category} <span>/</span> {copy.title.toUpperCase()}</div><h1>{copy.title}, <em>{copy.accent}</em></h1><p>{copy.description}</p></div>
          <div className="header-actions"><button className="paper-button"><Icon name="refresh" size={16} />Reset</button><button className="ink-button"><Icon name="shuffle" size={16} />Randomize</button></div>
        </header>

        <div className="topic-tabs">
          <button className={topic === "heap" ? "selected" : ""} onClick={() => setTopic("heap")}><span>01</span>Heap sort</button>
          <button className={topic === "graph" ? "selected" : ""} onClick={() => setTopic("graph")}><span>02</span>Graph traversal</button>
          <button className={topic === "knapsack" ? "selected" : ""} onClick={() => setTopic("knapsack")}><span>03</span>0/1 Knapsack</button>
        </div>

        <div className="page-grid">
          <section className={`heap-board board-${topic}`}><div className="tape tape-left" />{topic === "heap" ? <HeapBoard /> : topic === "graph" ? <GraphBoard /> : <KnapsackBoard />}</section>
          <Facts topic={topic} />
        </div>
      </main>
    </div>
  );
}
