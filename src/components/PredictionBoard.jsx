export default function PredictionBoard({ predictions }) {
  return (
    <div className="prediction-board" aria-label="来館者の予想">
      {predictions.slice(-8).map((prediction) => {
        const difference = Number(prediction.difference ?? 0);
        const unit = prediction.unit || "%";
        const min = prediction.min ?? 0;
        const max = prediction.max ?? 100;
        const fill = ((prediction.guess - min) / (max - min)) * 100;
        const close = difference <= (unit === "倍" ? 1 : 5);
        return (
          <article key={prediction.id} className={close ? "prediction-card close" : "prediction-card"}>
            <span className="prediction-topic">{prediction.shortTitle || "イカの割合"}</span>
            <div className="prediction-ring" style={{ "--prediction": `${fill}%` }}>
              <strong>{prediction.guess}<small>{unit}</small></strong>
            </div>
            <p>{close ? "正解にかなり近い！" : `正解との差 ${difference.toFixed(1)}${unit}`}</p>
          </article>
        );
      })}
    </div>
  );
}
