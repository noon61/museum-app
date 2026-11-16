import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import FloatingDrawings from "../components/FloatingDrawings";
import PredictionBoard from "../components/PredictionBoard";

const COLOR_FREQUENCIES = {
  "#ffffff": 523.25,
  "#67e8f9": 659.25,
  "#f9a8d4": 783.99,
  "#fde047": 880,
  "#a7f3d0": 587.33,
};

export default function Display() {
  const [answers, setAnswers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);
  const previousCountRef = useRef(null);
  const quizMode = new URLSearchParams(window.location.search).get("mode") === "quiz";

  useEffect(() => {
    const answersQuery = query(collection(db, "answers"), orderBy("createdAt", "asc"));
    return onSnapshot(answersQuery, (snapshot) => {
      setAnswers(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
    }, (error) => console.error("Firestoreエラー", error));
  }, []);

  useEffect(() => {
    if (!quizMode) return undefined;
    const predictionsQuery = query(collection(db, "predictions"), orderBy("createdAt", "asc"));
    return onSnapshot(predictionsQuery, (snapshot) => {
      setPredictions(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
    }, (error) => console.error("Firestoreエラー", error));
  }, [quizMode]);

  useEffect(() => {
    if (previousCountRef.current === null) {
      previousCountRef.current = answers.length;
      return;
    }
    if (!soundEnabled || answers.length <= previousCountRef.current) {
      previousCountRef.current = answers.length;
      return;
    }

    const latest = answers[answers.length - 1];
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const pressure = latest.averagePressure || 0.5;
    const frequency = COLOR_FREQUENCIES[latest.dominantColor] || 523.25;
    oscillator.type = pressure > 0.7 ? "sawtooth" : pressure > 0.4 ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * (1 + pressure * 0.5), context.currentTime + 1.2);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08 + pressure * 0.12, context.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.8);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 1.9);
    previousCountRef.current = answers.length;
  }, [answers, soundEnabled]);

  const enableSound = async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    await audioContextRef.current.resume();
    setSoundEnabled(true);
  };

  return (
    <main className="display-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {quizMode ? <PredictionBoard predictions={predictions} /> : <FloatingDrawings answers={answers} />}

      <section className="display-question">
        {quizMode ? (
          <>
            <h1>函館データ<br />みんなの予想</h1>
            <span>{predictions.length} predictions</span>
          </>
        ) : (
          <>
            <p>YOUR WORDS BEGIN TO FLOAT</p>
            <h1>描いた言葉が、<br />空間に浮かび上がる。</h1>
            <span>{answers.length} drawings</span>
          </>
        )}
      </section>

      {!quizMode && !soundEnabled && (
        <button type="button" className="sound-button" onClick={enableSound}>
          ◉ 音を有効にする
        </button>
      )}
    </main>
  );
}
