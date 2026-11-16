import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import StatDocument from "../components/StatDocument";
import { getStatDocument, STAT_DOCUMENTS } from "../data/statistics";

export default function AnnotationWall() {
  const [documentId, setDocumentId] = useState(STAT_DOCUMENTS[0].id);
  const [annotations, setAnnotations] = useState([]);
  const [rotation, setRotation] = useState(0);

  useEffect(() => onSnapshot(collection(db, "annotations"), (snapshot) => setAnnotations(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (error) => console.error("Firestoreエラー", error)), []);
  useEffect(() => onSnapshot(doc(db, "exhibition", "state"), (snapshot) => {
    const data = snapshot.data();
    if (data?.currentDocumentId) { setDocumentId(data.currentDocumentId); setRotation(data.currentRotation || 0); }
  }, (error) => console.error("表示状態エラー", error)), []);

  const documentData = getStatDocument(documentId);
  const pageNumbers = documentData.pages.map((item) => item.page).join("–");
  const marks = useMemo(() => annotations.filter((item) => item.kind === "document-mark" && item.documentId === documentData.id && !item.cellId).slice(-60), [annotations, documentData.id]);

  return <main className="annotation-wall document-wall">
    <header className="wall-header"><div><p>{documentData.category}の統計表</p><h1>{documentData.title}</h1></div><div className="wall-status"><span>みんなの付箋 {marks.length}件</span><small>p.{pageNumbers}・iPadとスマホから参加できます</small></div></header>
    <section className="document-wall-stage spread-stage"><div className={`book-spread ${rotation === 90 ? "rotated-90" : ""}`}>{documentData.pages.map((item) => <StatDocument key={item.id} page={item} marks={marks.filter((mark) => mark.pageId === item.id)} className="projection-document" />)}</div></section>
    <footer className="wall-footer"><p>統計表に重なる、みんなの付箋</p><div>{STAT_DOCUMENTS.map((item) => <span key={item.id} className={item.id === documentData.id ? "active" : ""} />)}</div></footer>
  </main>;
}
