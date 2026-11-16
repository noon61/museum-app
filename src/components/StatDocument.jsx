import HandwritingSvg from "./HandwritingSvg";

export default function StatDocument({ page, marks = [], selectedPoint, onSelect, className = "" }) {
  const choosePosition = (event) => {
    if (!onSelect) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onSelect({
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    });
  };

  return (
    <div className={`stat-document ${onSelect ? "selectable" : ""} ${className}`} onClick={choosePosition}>
      <img src={page.image} alt={`${page.label} ${page.page}ページ`} draggable="false" />
      <div className="document-mark-layer">
        {marks.map((mark) => (
          <div
            key={mark.id}
            className="document-mark"
            style={{ left: `${mark.x * 100}%`, top: `${mark.y * 100}%`, "--mark-color": mark.personaColor || "#ef6f73" }}
          >
            <i />
            {mark.inputType === "keyboard" ? <p>{mark.text}</p> : <HandwritingSvg strokes={mark.strokes} color={mark.personaColor} />}
          </div>
        ))}
        {selectedPoint && (
          <div className="document-mark selected" style={{ left: `${selectedPoint.x * 100}%`, top: `${selectedPoint.y * 100}%`, "--mark-color": "var(--persona-color, #ef6f73)" }}>
            <i />
          </div>
        )}
      </div>
    </div>
  );
}
