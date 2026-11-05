import { BoardHeader, Facts } from "@/components/study-ui";

export default function KnapsackPage() {
  const cells = [
    [0,0,0,0,0,0],[0,0,3,3,3,3],[0,0,3,4,4,7],[0,0,3,4,5,7],
  ];
  return (
    <div className="page-grid">
      <section className="heap-board board-knapsack"><div className="tape tape-left" />
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
      </section>
      <Facts topic="knapsack" />
    </div>
  );
}

