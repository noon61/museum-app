import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import DataGraph from "../components/DataGraph";
import { getGraph, getGuidedPrompt, getPersona, GRAPHS } from "../data/exhibition";

export default function DataExperience() {
  const { personaId, mode } = useParams();
  const navigate = useNavigate();
  const persona = getPersona(personaId);
  const guided = mode === "guided";
  const [chosenGraphId, setChosenGraphId] = useState(persona.defaultGraphId || GRAPHS[0].id);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [comment, setComment] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [sessionId] = useState(() => {
    const storageKey = "museum-participant-id";
    try {
      const storedId = window.localStorage.getItem(storageKey);
      if (storedId) return storedId;

      const newId = window.crypto?.randomUUID?.()
        || `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem(storageKey, newId);
      return newId;
    } catch (error) {
      console.warn("参加者IDを端末に保存できませんでした", error);
      return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    }
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => onSnapshot(collection(db, "annotations"), (snapshot) => {
    setAnnotations(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, (error) => console.error("Firestoreエラー", error)), []);

  const graph = getGraph(chosenGraphId);

  const activePoint = selectedPoint?.graphId === graph.id ? selectedPoint : null;

  const counts = useMemo(() => annotations
    .filter((item) => item.sessionId === sessionId && item.graphId === graph.id)
    .reduce((result, item) => ({ ...result, [item.pointId]: (result[item.pointId] || 0) + 1 }), {}), [annotations, graph.id, sessionId]);
  const visibleAnnotations = useMemo(() => annotations
    .filter((item) => item.sessionId === sessionId && item.graphId === graph.id && (!activePoint || item.pointId === activePoint.id))
    .slice(-20)
    .reverse(), [annotations, graph.id, activePoint, sessionId]);

  const submit = async () => {
    if (!activePoint || !comment.trim() || !sessionId) return;
    setSending(true);
    try {
      await addDoc(collection(db, "annotations"), {
        personaId: persona.id,
        personaName: persona.name,
        personaRole: persona.role,
        personaAge: persona.age,
        personaColor: persona.color,
        sessionId,
        mode: guided ? "guided" : "explore",
        graphId: graph.id,
        graphTitle: graph.title,
        pointId: activePoint.id,
        pointLabel: activePoint.label,
        value: activePoint.value,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setComment("");
      setSent(true);
    } catch (error) {
      console.error(error);
      alert("付箋を送れませんでした。通信状態を確認してください。");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="experience-page" style={{ "--persona-color": persona.color }}>
      <header className="experience-header">
        <button type="button" onClick={() => navigate(`/persona/${persona.id}`)}>←</button>
        <div><span>{persona.role}</span><strong>{persona.name}</strong></div>
        <small>{guided ? "問いから見る" : "自由に見る"}</small>
      </header>

      <section className="experience-content">
        <div className="graph-tabs">
          {GRAPHS.map((item) => (
            <button key={item.id} className={item.id === graph.id ? "active" : ""} onClick={() => setChosenGraphId(item.id)}>
              {item.category}
            </button>
          ))}
        </div>

        {guided && <p className="sync-label"><span /> この人物に割り当てられたグラフから開始しました</p>}
        <p className="graph-category">{graph.category}</p>
        <h1>{graph.title}</h1>
        <p className="graph-help">気になる点をタップしてください</p>
        <DataGraph graph={graph} selectedId={activePoint?.id} onSelect={(point) => { setSelectedPoint({ ...point, graphId: graph.id }); setSent(false); }} counts={counts} compact />
        <p className="graph-source">出典：{graph.source}</p>

        {activePoint && (
          <section className="comment-sheet">
            <div className="selected-data">
              <span>{activePoint.label}</span>
              <strong>
                {activePoint.value.toLocaleString()}{graph.unit}
                {activePoint.secondaryValue != null && `・${activePoint.secondaryValue.toLocaleString()}${graph.secondaryUnit}`}
              </strong>
            </div>
            <h2>{guided ? getGuidedPrompt(persona.role, graph) : "このデータのどこが気になりましたか？"}</h2>
            {sent ? (
              <div className="sent-message">
                <strong>付箋を貼りました！</strong>
                <p>このグラフが会場に表示されたとき、あなたのコメントが現れます。</p>
                <button type="button" onClick={() => { setSelectedPoint(null); setSent(false); }}>ほかのデータを見る</button>
              </div>
            ) : (
              <>
                <textarea
                  value={comment}
                  maxLength={60}
                  placeholder="例：ここで急に増えたのはなぜ？"
                  onChange={(event) => setComment(event.target.value)}
                />
                <div className="comment-footer"><span>{comment.length}/60</span><button type="button" disabled={!comment.trim() || !sessionId || sending} onClick={submit}>{sending ? "送信中…" : "付箋を貼る"}</button></div>
              </>
            )}
          </section>
        )}

        <section className="phone-notes">
          <div className="phone-notes-heading">
                <div><p>あなたの付箋</p><h2>{activePoint ? `${activePoint.label}へのコメント` : graph.title}</h2></div>
            <strong>{visibleAnnotations.length}件</strong>
          </div>
          {visibleAnnotations.length === 0 ? (
            <p className="empty-notes">このスマホから貼った付箋はまだありません。</p>
          ) : (
            <div className="phone-note-list">
              {visibleAnnotations.map((item) => (
                <article key={item.id} style={{ "--note-color": getPersona(item.personaId).color || item.personaColor || "#d9dce5" }}>
                    <span>{item.mode === "guided" ? "問い" : "発見"}</span>
                    <p>{item.comment}</p>
                    <small>{item.pointLabel} ・ {getPersona(item.personaId).age}歳・{getPersona(item.personaId).role}</small>
                  </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
