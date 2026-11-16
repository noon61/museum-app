const WIDTH = 760;
const HEIGHT = 390;
const PAD = { top: 32, right: 34, bottom: 58, left: 82 };

export default function DataGraph({ graph, selectedId, onSelect, counts = {}, compact = false }) {
  const max = Math.max(...graph.values.map((point) => point.value)) * 1.12;
  const positions = graph.values.map((point, index) => ({
    ...point,
    x: PAD.left + (index / Math.max(graph.values.length - 1, 1)) * (WIDTH - PAD.left - PAD.right),
    y: PAD.top + (1 - point.value / max) * (HEIGHT - PAD.top - PAD.bottom),
    secondaryY: point.secondaryValue == null ? null : PAD.top + (1 - point.secondaryValue / max) * (HEIGHT - PAD.top - PAD.bottom),
  }));
  const path = positions.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const secondaryPath = positions.some((point) => point.secondaryY != null)
    ? positions.map((point, index) => `${index ? "L" : "M"}${point.x},${point.secondaryY}`).join(" ")
    : null;
  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={compact ? "data-graph compact" : "data-graph"}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={graph.title}>
        {gridValues.map((ratio) => {
          const y = PAD.top + (1 - ratio) * (HEIGHT - PAD.top - PAD.bottom);
          return (
            <g key={ratio}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} className="graph-grid" />
              <text x={PAD.left - 12} y={y + 5} textAnchor="end" className="graph-axis-label">
                {Math.round(max * ratio).toLocaleString()}
              </text>
            </g>
          );
        })}
        <path d={path} className="graph-line" />
        {secondaryPath && <path d={secondaryPath} className="graph-line secondary" />}
        {secondaryPath && positions.map((point) => (
          <circle key={`secondary-${point.id}`} cx={point.x} cy={point.secondaryY} r="5" className="graph-secondary-point" />
        ))}
        {secondaryPath && (
          <g className="graph-legend" transform={`translate(${PAD.left + 8}, ${PAD.top + 10})`}>
            <line x1="0" x2="28" y1="0" y2="0" className="graph-line" />
            <text x="36" y="5">人口</text>
            <line x1="92" x2="120" y1="0" y2="0" className="graph-line secondary" />
            <text x="128" y="5">{graph.secondaryLabel}</text>
          </g>
        )}
        {positions.map((point, index) => {
          const count = counts[point.id] || 0;
          return (
            <g
              key={point.id}
              className={selectedId === point.id ? "graph-point selected" : "graph-point"}
              onClick={() => onSelect?.(point)}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
            >
              <circle cx={point.x} cy={point.y} r={selectedId === point.id ? 11 : 7} />
              <circle cx={point.x} cy={point.y} r="24" className="graph-hit-area" />
              {(index === 0 || index === positions.length - 1 || index % 2 === 0) && (
                <text x={point.x} y={HEIGHT - 24} textAnchor="middle" className="graph-axis-label">{point.label}</text>
              )}
              {count > 0 && (
                <g className="graph-count">
                  <circle cx={point.x + 18} cy={point.y - 20} r={count > 9 ? 16 : 13} />
                  <text x={point.x + 18} y={point.y - 15} textAnchor="middle">{count}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
