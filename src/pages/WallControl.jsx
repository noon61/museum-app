import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import StatDocument from "../components/StatDocument";
import { getStatDocument, STAT_DOCUMENTS } from "../data/statistics";

export default function WallControl() {
  const [documentId, setDocumentId] = useState(STAT_DOCUMENTS[0].id);
  const [pageIndex, setPageIndex] = useState(0);
  const [changing, setChanging] = useState(false);
  const [zoom, setZoom] = useState(0.75);
  const [rotation, setRotation] = useState(0);
  const documentData = getStatDocument(documentId);
  const pageNumbers = documentData.pages.map((item) => item.page).join("–");

  useEffect(() => onSnapshot(doc(db, "exhibition", "state"), (snapshot) => {
    const data = snapshot.data();
    if (data?.currentDocumentId) {
      setDocumentId(data.currentDocumentId);
      setPageIndex(data.currentPageIndex || 0);
      setRotation(data.currentRotation || 0);
    }
  }), []);

  const changeProjection = async (nextDocumentId, nextPageIndex = 0, nextRotation = rotation) => {
    const safeRotation = nextDocumentId === "education" ? nextRotation : 0;
    setChanging(true);
    try {
      await setDoc(doc(db, "exhibition", "state"), {
        currentDocumentId: nextDocumentId,
        currentPageIndex: nextPageIndex,
        currentViewMode: "original",
        currentRotation: safeRotation,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setDocumentId(nextDocumentId);
      setPageIndex(nextPageIndex);
      setRotation(safeRotation);
    } catch (error) {
      console.error(error);
      alert("プロジェクターの表示を変更できませんでした。");
    } finally {
      setChanging(false);
    }
  };

  return <main className="wall-control document-control">
    <header><div><h1>投影する統計表を選ぶ</h1></div><span><i /> プロジェクターと接続中</span></header>
    <section className="control-grid">
      {STAT_DOCUMENTS.map((item, index) => <button key={item.id} className={item.id === documentId ? "active" : ""} disabled={changing} onClick={() => changeProjection(item.id, 0)}>
        <span>0{index + 1} / {item.category}</span><strong>{item.title}</strong>{item.id === documentId && <b>投影中</b>}
      </button>)}
    </section>
    {documentData.id === "education" && <section className="view-mode-switch"><button className={rotation === 90 ? "active" : ""} onClick={() => changeProjection(documentData.id, pageIndex, rotation === 90 ? 0 : 90)}>↻ 90度回転</button></section>}
    <section className="control-browser">
      <div className="control-tools"><div><span>現在投影中</span><strong>{documentData.title}・p.{pageNumbers}</strong></div><label>縮小 <input type="range" min="0.35" max="1.2" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /> 拡大</label><button onClick={() => setZoom(0.6)}>表示を戻す</button></div>
      <div key={documentId} className="control-document-viewport"><div className={`book-spread ${rotation === 90 ? "rotated-90" : ""}`} style={{ width: `${zoom * 2486}px` }}>{documentData.pages.map((item) => <StatDocument key={item.id} page={item} />)}</div></div>
    </section>
  </main>;
}
