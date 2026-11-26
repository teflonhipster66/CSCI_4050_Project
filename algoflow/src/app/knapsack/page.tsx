"use client";

import { useEffect, useState } from "react";
import {
  getKnapsackSelectionValues,
  randomizeKnapsackItems,
  solveNextKnapsackCell,
  traceKnapsackSelection,
  type KnapsackItem,
} from "@/algorithms/knapsack";
import { BoardHeader, Facts } from "@/components/study-ui";

const MAX_ITEMS = 5;
const MAX_ITEM_VALUE = 10;
const MAX_CAPACITY = 10;
const pseudocode = [
  "dp[0][w] = 0 for every capacity w",
  "for i = 1 to number of items:",
  "  for w = 0 to max capacity:",
  "    skip = dp[i - 1][w]",
  "    if weight[i] > w: dp[i][w] = skip",
  "    else: dp[i][w] = max(skip, value[i] + dp[i - 1][w - weight[i]])",
];

export default function KnapsackPage() {
  const [itemCount, setItemCount] = useState(3);
  const [maxValue, setMaxValue] = useState(5);
  const [capacity, setCapacity] = useState(5);
  const [items, setItems] = useState<KnapsackItem[]>([]);
  const [solvedValues, setSolvedValues] = useState<number[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [autoSolve, setAutoSolve] = useState(false);
  const capacities = Array.from({ length: capacity + 1 }, (_, weight) => weight);
  const totalCells = items.length * capacities.length;
  const complete = solvedValues.length === totalCells;
  const running = autoSolve && !complete;
  const lastCell = solvedValues.length - 1;
  const lastItem = items[Math.floor(lastCell / capacities.length)];
  const activeLine = lastItem ? (lastItem.weight > lastCell % capacities.length ? 4 : 5) : -1;
  const selectionValues = getKnapsackSelectionValues(solvedValues, capacity);
  const selectionTrace = traceKnapsackSelection(items, capacity, selectionValues);
  const selectedItems = selectionTrace.filter((step) => step.selected === 1);
  const tables = [
    {
      id: "value",
      title: "Value Table",
      answers: solvedValues,
      answerLabel: "Best value through item",
      answerPattern: /^\d*$/,
    },
    {
      id: "selection",
      title: "Selection Table",
      answers: selectionValues,
      answerLabel: "Selection for item",
      answerPattern: /^[01]?$/,
    },
  ];

  useEffect(() => {
    if (!running) return;

    const timeout = window.setTimeout(() => {
      setSolvedValues((values) => solveNextKnapsackCell(items, capacity, values));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [capacity, items, running, solvedValues]);

  function resetTable() {
    setAutoSolve(false);
    setSolvedValues([]);
    setDrafts({});
  }

  return (
    <div className="page-grid">
      <section className="heap-board board-knapsack" aria-labelledby="knapsack-input-title">
        <div className="tape tape-left" />
        <BoardHeader
          step="0/1 KNAPSACK"
          title="Choose the items for your knapsack"
          titleId="knapsack-input-title"
          progress={`${solvedValues.length}/${totalCells}`}
        />
        <div className="instruction-note blue-note">
          <span className="note-arrow" aria-hidden="true">↳</span>
          <p>Choose the combination of items with the max value without exceeding the capacity. Each item can be selected only once.
            Final combination is shown at the bottom.
          </p>
        </div>

        <form
          className="heap-input knapsack-input"
          onSubmit={(event) => {
            event.preventDefault();
            setItems(randomizeKnapsackItems(itemCount, maxValue));
            resetTable();
          }}
        >
          <div className="heap-input-row knapsack-input-row">
            <div>
              <label htmlFor="knapsack-item-count">Number of items: {itemCount}</label>
              <input
                id="knapsack-item-count"
                className="heap-range-slider"
                type="range"
                min={1}
                max={MAX_ITEMS}
                step={1}
                value={itemCount}
                onChange={(event) => setItemCount(Number(event.target.value))}
              />
            </div>
            <div>
              <label htmlFor="knapsack-max-value">Max weight/value: {maxValue}</label>
              <input
                id="knapsack-max-value"
                className="heap-range-slider"
                type="range"
                min={0}
                max={MAX_ITEM_VALUE}
                step={1}
                value={maxValue}
                onChange={(event) => setMaxValue(Number(event.target.value))}
              />
            </div>
            <div>
              <label htmlFor="knapsack-capacity">Max capacity: {capacity}</label>
              <input
                id="knapsack-capacity"
                className="heap-range-slider"
                type="range"
                min={0}
                max={MAX_CAPACITY}
                step={1}
                value={capacity}
                onChange={(event) => {
                  setCapacity(Number(event.target.value));
                  resetTable();
                }}
              />
            </div>
            <button type="submit" className="heap-control-button primary-control">
              Randomize input
            </button>
          </div>
        </form>

        <div className="item-notes" aria-live="polite">
          {items.map(({ weight, value }, index) => (
            <div key={index}>
              <span>item {index + 1}</span>
              <strong>weight: {weight}</strong>
              <strong>value: {value}</strong>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="knapsack-results">
            <div className="bfs-playback-row knapsack-playback-row">
              <p>Max capacity = {capacity}</p>
              <div className="heap-step-actions bfs-playback-controls">
                <button type="button" className="heap-control-button" onClick={resetTable}>Reset</button>
                <button type="button" className="heap-control-button" disabled={complete} onClick={() => setAutoSolve(!running)}>
                  {running ? "Pause" : "Auto solve"}
                </button>
                <button type="button" className="heap-control-button" disabled={lastCell < 0} onClick={() => {
                  setAutoSolve(false);
                  setSolvedValues((values) => values.slice(0, -1));
                }}>Previous step</button>
                <button type="button" className="heap-control-button primary-control" disabled={running || complete} onClick={() => {
                  setSolvedValues((values) => solveNextKnapsackCell(items, capacity, values));
                }}>Next step</button>
              </div>
            </div>
            {tables.map(({ id, title, answers, answerLabel, answerPattern }) => (
              <div key={id} className="knapsack-table-scroll" role="region" aria-label={title} tabIndex={0}>
                <table className="knapsack-value-table">
                  <caption>
                    {title}
                    {id === "selection" && <small>0 = skip, 1 = take</small>}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Item</th>
                      <th scope="col">Weight</th>
                      <th scope="col">Value</th>
                      {capacities.map((maxWeight) => (
                        <th key={maxWeight} scope="col" aria-label={`Max weight ${maxWeight}`}>
                          {maxWeight}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ weight, value }, index) => (
                      <tr key={index}>
                        <th scope="row">Item {index + 1}</th>
                        <td>{weight}</td>
                        <td>{value}</td>
                        {capacities.map((maxWeight) => {
                          const cell = index * capacities.length + maxWeight;
                          const draftKey = `${id}-${cell}`;
                          return (
                            <td key={maxWeight} className={cell === lastCell ? "knapsack-current-cell" : undefined}>
                              <div className="knapsack-cell-content">
                                {cell < answers.length ? (
                                  <span>{answers[cell]}</span>
                                ) : (
                                  <input
                                    aria-label={`${answerLabel} ${index + 1} at capacity ${maxWeight}`}
                                    type="text"
                                    inputMode="numeric"
                                    value={drafts[draftKey] ?? ""}
                                    onChange={(event) => {
                                      const value = event.target.value;
                                      if (answerPattern.test(value)) setDrafts((entries) => ({ ...entries, [draftKey]: value }));
                                    }}
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <section className="knapsack-trace" aria-labelledby="knapsack-trace-title">
              <h3 id="knapsack-trace-title">Final selection of items</h3>
              {complete ? (
                <>
                  <ol className="knapsack-trace-steps">
                    {selectionTrace.map(({ itemIndex, capacity, selected, remainingCapacity }) => (
                      <li key={itemIndex}>
                        <div>({capacity}, item {itemIndex + 1}) = {selected}</div>
                        {selected === 1 && (
                          <div>{capacity} − {items[itemIndex].weight} = {remainingCapacity}</div>
                        )}
                      </li>
                    ))}
                  </ol>
                  <p><strong>Knapsack contains</strong> {selectedItems.length > 0
                    ? selectedItems.map(({ itemIndex }) => `item ${itemIndex + 1}`).join(", ")
                    : "no items"}.</p>
                </>
              ) : (
                <p>Finish solving the table before deciding which items to select.</p>
              )}
            </section>
          </div>
        )}
      </section>
      <Facts topic="knapsack" />
    </div>
  );
}
