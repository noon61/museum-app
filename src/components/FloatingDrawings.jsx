export default function FloatingDrawings({ answers }) {
  return (
    <div className="floating-drawings" aria-label="みんなが描いた文字">
      {answers.slice(-8).map((answer, index) => {
        const pressure = answer.averagePressure || 0.5;
        const color = answer.dominantColor || "#ffffff";

        return (
          <figure
            key={answer.id}
            className="floating-drawing"
            style={{
              "--drawing-rotate": `${(index % 3 - 1) * 2}deg`,
              "--drawing-delay": `${-0.7 * index}s`,
              "--drawing-color": color,
              "--drawing-glow": `${12 + pressure * 32}px`,
              "--drawing-duration": `${7 - pressure * 2}s`,
              "--drawing-scale": 0.88 + pressure * 0.2,
            }}
          >
            <img src={answer.image} alt="来館者が描いた文字" />
          </figure>
        );
      })}
    </div>
  );
}
