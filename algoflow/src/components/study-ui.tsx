export type Topic = "heap" | "bfs" | "dfs" | "knapsack";

export function Icon({ name, size = 18 }: { name: "grid" | "book" | "chart" | "settings" | "refresh" | "shuffle" | "arrow" | "bulb" | "clock" | "box"; size?: number }) {
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

export function BoardHeader({ step, title, progress }: { step: string; title: string; progress: string }) {
  const [current, total] = progress.split("/").map(Number);
  const progressPercent = Number.isFinite(current) && Number.isFinite(total) && total > 0
    ? Math.max(0, Math.min(100, (current / total) * 100))
    : 0;

  return <div className="board-header"><div><span className="step-label">{step}</span><h2>{title}</h2></div><div className="progress-doodle"><span>{progress}</span><svg viewBox="0 0 104 16" aria-hidden="true"><path d="M2 8c24 2 64-3 100 0"/><path className="progress-ink" pathLength="100" strokeDasharray={`${progressPercent} ${100 - progressPercent}`} strokeDashoffset="0" d="M2 8c24 2 64-3 100 0"/></svg></div></div>;
}

export function PencilCallout({ text, left, top }: { text: string; left: string; top: string }) {
  return <div className="pencil-callout" style={{ left, top }}><span>{text}</span><svg viewBox="0 0 64 42" aria-hidden="true"><path d="M60 2C40 5 20 9 8 33"/><path d="m4 26 4 8 8-3"/></svg></div>;
}

export function Facts({ topic }: { topic: Topic }) {
  const content = {
    heap: { big: "A max heap only promises that every parent is larger than its children.", note: "not fully sorted!", time: "O(n log n)", timeCopy: "Building is O(n). Each extraction takes O(log n).", space: "O(1)", spaceCopy: "Heap sort works in place — no extra array needed.", rule: <>For a node at index <i>i</i>:</>, rows: [["left child","2i + 1"],["right child","2i + 2"]] },
    bfs: { big: "BFS explores a graph one whole layer at a time, starting from the source.", note: "think ripples!", time: "O(V + E)", timeCopy: "Every vertex and every edge is considered once.", space: "O(V)", spaceCopy: "The queue may hold an entire layer of vertices.", rule: <>The queue is <i>FIFO</i>:</>, rows: [["add nodes","at the back"],["visit nodes","from the front"]] },
    dfs: { big: "DFS follows one path as far as possible before backtracking.", note: "go deeper!", time: "O(V + E)", timeCopy: "Every vertex and every edge is considered once.", space: "O(V)", spaceCopy: "The stack tracks vertices still waiting to be explored.", rule: <>The stack is <i>LIFO</i>:</>, rows: [["add nodes","on top"],["visit nodes","from the top"]] },
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
