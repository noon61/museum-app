import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getQuiz, QUIZZES } from "../data/quizzes";

export default function Quiz() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const quiz = getQuiz(selectedId);
  const [guess, setGuess] = useState(0);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  const selectQuiz = (item) => {
    setSelectedId(item.id);
    setGuess(item.initial);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitGuess = async () => {
    setSending(true);
    const difference = Math.abs(guess - quiz.answer);
    try {
      await addDoc(collection(db, "predictions"), {
        quizId: quiz.id,
        shortTitle: quiz.shortTitle,
        guess,
        answer: quiz.answer,
        min: quiz.min,
        max: quiz.max,
        unit: quiz.unit,
        difference,
        createdAt: serverTimestamp(),
      });
      setResult({ difference });
    } catch (error) {
      console.error(error);
      alert("送信に失敗しました。通信状態を確認してください。");
    } finally {
      setSending(false);
    }
  };

  if (!quiz) {
    return (
      <main className="quiz-page quiz-menu-page">
        <section className="quiz-panel">
          <p className="quiz-kicker">函館市史から予想してみよう</p>
          <h1>気になるデータを選んでください</h1>
          <div className="quiz-menu">
            {QUIZZES.map((item) => (
              <button key={item.id} type="button" onClick={() => selectQuiz(item)} style={{ "--quiz-accent": item.accent }}>
                <span>{item.category}</span>
                <strong>{item.question}</strong>
                <small>予想する →</small>
              </button>
            ))}
          </div>
          <button type="button" className="quiz-back" onClick={() => navigate("/")}>← トップへ戻る</button>
        </section>
      </main>
    );
  }

  const shownValue = result ? quiz.answer : guess;
  const fill = ((shownValue - quiz.min) / (quiz.max - quiz.min)) * 100;

  return (
    <main className="quiz-page" style={{ "--quiz-accent": quiz.accent }}>
      <section className="quiz-panel">
        <p className="quiz-kicker">{quiz.category}のデータ</p>
        <h1>{quiz.question}</h1>
        <div className="quiz-main">
          <div className="guess-circle" style={{ "--guess": `${fill}%` }}>
            <div>
              <span>{result ? "正解" : "あなたの予想"}</span>
              <strong>{shownValue}<small>{quiz.unit}</small></strong>
            </div>
          </div>

          <div className="quiz-controls">
            {!result ? (
              <>
                <label htmlFor="data-guess">円を見ながら予想を動かしてください</label>
                <input
                  id="data-guess"
                  type="range"
                  min={quiz.min}
                  max={quiz.max}
                  step={quiz.step}
                  value={guess}
                  onChange={(event) => setGuess(Number(event.target.value))}
                />
                <div className="range-labels"><span>{quiz.min}{quiz.unit}</span><span>{quiz.max}{quiz.unit}</span></div>
                <button type="button" className="quiz-submit" onClick={submitGuess} disabled={sending}>
                  {sending ? "送信中…" : "この予想で答える"}
                </button>
              </>
            ) : (
              <div className="quiz-result">
                <p>あなたの予想は <strong>{guess}{quiz.unit}</strong></p>
                <p>正解との差は <strong>{result.difference.toFixed(1)}{quiz.unit}</strong></p>
                <p className="quiz-fact">{quiz.fact}</p>
                <p className="quiz-source">出典：{quiz.source}</p>
                <button type="button" className="quiz-submit" onClick={() => setSelectedId(null)}>別の問題に挑戦</button>
              </div>
            )}
          </div>
        </div>
        {!result && <button type="button" className="quiz-back" onClick={() => setSelectedId(null)}>← 問題を選び直す</button>}
      </section>
    </main>
  );
}
