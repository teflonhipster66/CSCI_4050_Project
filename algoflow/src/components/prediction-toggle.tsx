const activeStyle = { backgroundColor: "#315d8b", borderColor: "#244565", color: "#fff" };

export function PredictionToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="heap-control-button"
      aria-pressed={enabled}
      style={enabled ? activeStyle : undefined}
      onClick={onToggle}
    >
      Prediction mode <span aria-hidden="true">· {enabled ? "On" : "Off"}</span>
    </button>
  );
}
