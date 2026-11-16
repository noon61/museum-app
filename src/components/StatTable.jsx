import HandwritingSvg from "./HandwritingSvg";

export default function StatTable({ graph, selectedId, onSelect, marks = {}, displayMode = "interactive" }) {
  return (
    <div className={`stat-table ${displayMode === "projection" ? "projection" : ""}`}>
      <div className="stat-table-heading">
        <p>{graph.category}</p>
        <h2>{graph.title}</h2>
        <small>{graph.source}</small>
      </div>
      <table>
        <thead>
          <tr>
            <th>年</th>
            <th>{graph.title.includes("戸数・人口") ? "人口" : graph.category}</th>
            {graph.secondaryLabel && <th>{graph.secondaryLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {graph.values.map((point) => {
            const pointMarks = marks[point.id] || [];
            const latest = pointMarks[pointMarks.length - 1];
            return (
              <tr key={point.id} className={selectedId === point.id ? "selected" : ""}>
                <th>{point.label}</th>
                <td className={pointMarks.length ? "marked" : ""}>
                  <button
                    type="button"
                    disabled={!onSelect}
                    onClick={() => onSelect?.(point)}
                    aria-label={`${point.label} ${point.value}${graph.unit}`}
                  >
                    <span>{point.value.toLocaleString()}</span><small>{graph.unit}</small>
                  </button>
                  {latest && (
                    <div className="table-mark" style={{ "--mark-color": latest.personaColor || "#ef6f73" }}>
                      <i />
                      <HandwritingSvg strokes={latest.strokes} color={latest.personaColor} />
                      {pointMarks.length > 1 && <b>{pointMarks.length}件</b>}
                    </div>
                  )}
                </td>
                {graph.secondaryLabel && (
                  <td><span className="secondary-number">{point.secondaryValue?.toLocaleString() ?? "—"}</span><small>{graph.secondaryUnit}</small></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
