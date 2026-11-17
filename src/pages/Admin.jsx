import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, onSnapshot, query, where, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { getStatDocument, STAT_DOCUMENTS } from "../data/statistics";

const ADMIN_PIN = "2026";

export default function Admin() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("museum-admin") === "unlocked");
  const [documentId, setDocumentId] = useState(STAT_DOCUMENTS[0].id);
  const [annotations, setAnnotations] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => onSnapshot(doc(db, "exhibition", "state"), (snapshot) => {
    const currentDocumentId = snapshot.data()?.currentDocumentId;
    if (currentDocumentId) setDocumentId(currentDocumentId);
  }, (error) => console.error("表示状態エラー", error)), []);

  useEffect(() => onSnapshot(query(collection(db, "annotations"), where("kind", "==", "document-mark")), (snapshot) => {
    setAnnotations(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, (error) => console.error("付箋の取得エラー", error)), []);

  const documentData = getStatDocument(documentId);
  const currentCount = useMemo(() => annotations.filter((item) => item.documentId === documentId).length, [annotations, documentId]);

  const unlock = (event) => {
    event.preventDefault();
    if (pin !== ADMIN_PIN) {
      setMessage("管理コードが違います。");
      return;
    }
    sessionStorage.setItem("museum-admin", "unlocked");
    setUnlocked(true);
    setMessage("");
  };

  const removeMarks = async (scope) => {
    const targetLabel = scope === "current" ? `「${documentData.category}」の付箋 ${currentCount}件` : `すべての付箋 ${annotations.length}件`;
    if (!window.confirm(`${targetLabel}を削除します。\nこの操作は元に戻せません。よろしいですか？`)) return;

    setDeleting(true);
    setMessage("");
    try {
      const snapshot = await getDocs(query(collection(db, "annotations"), where("kind", "==", "document-mark")));
      const targets = snapshot.docs.filter((item) => scope === "all" || item.data().documentId === documentId);
      for (let index = 0; index < targets.length; index += 450) {
        const batch = writeBatch(db);
        targets.slice(index, index + 450).forEach((item) => batch.delete(item.ref));
        await batch.commit();
      }
      setMessage(`${targets.length}件の付箋を削除しました。`);
    } catch (error) {
      console.error(error);
      setMessage("削除できませんでした。通信状態を確認してください。");
    } finally {
      setDeleting(false);
    }
  };

  if (!unlocked) return <main className="admin-page"><section className="admin-card admin-login">
    <p className="admin-kicker">運営専用</p>
    <h1>展示管理</h1>
    <form onSubmit={unlock}>
      <label htmlFor="admin-pin">4桁の管理コード</label>
      <input id="admin-pin" value={pin} maxLength={4} inputMode="numeric" autoComplete="off" onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} />
      <button type="submit">管理画面を開く</button>
    </form>
    {message && <p className="admin-message error">{message}</p>}
  </section></main>;

  return <main className="admin-page"><section className="admin-card">
    <div className="admin-heading"><div><p className="admin-kicker">運営専用</p><h1>付箋の管理</h1></div><button className="admin-lock" onClick={() => { sessionStorage.removeItem("museum-admin"); setUnlocked(false); setPin(""); }}>閉じる</button></div>
    <div className="admin-current"><span>現在表示中</span><strong>{documentData.category}</strong><p>{documentData.title}</p></div>
    <div className="admin-counts"><div><span>この統計表</span><strong>{currentCount}<small>件</small></strong></div><div><span>全統計表</span><strong>{annotations.length}<small>件</small></strong></div></div>
    <div className="admin-delete-actions">
      <button disabled={deleting || currentCount === 0} onClick={() => removeMarks("current")}>表示中の付箋を削除</button>
      <button className="danger" disabled={deleting || annotations.length === 0} onClick={() => removeMarks("all")}>すべての付箋を削除</button>
    </div>
    {message && <p className="admin-message">{message}</p>}
    <p className="admin-warning">削除した付箋は元に戻せません。</p>
  </section></main>;
}
