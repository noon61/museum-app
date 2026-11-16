import { useNavigate, useParams } from "react-router-dom";
import { getPersona } from "../data/exhibition";

export default function Persona() {
  const { personaId } = useParams();
  const navigate = useNavigate();
  const persona = getPersona(personaId);

  return (
    <main className="persona-page" style={{ "--persona-color": persona.color }}>
      <section className="persona-sheet">
        <p className="persona-overline">あなたのなりきりカード</p>
        <div className="persona-heading">
          <div className="persona-portrait" aria-hidden="true"><span>{persona.initials}</span></div>
          <div>
            <small>{persona.ruby}</small>
            <h1>{persona.name}</h1>
            <dl>
              <div><dt>時代</dt><dd>{persona.eraLabel || `${persona.year}年`}</dd></div>
              <div><dt>性別</dt><dd>{persona.gender}</dd></div>
              <div><dt>年齢</dt><dd>{persona.age}歳</dd></div>
              <div><dt>職業</dt><dd>{persona.role}</dd></div>
            </dl>
          </div>
        </div>
        <div className="persona-story">
          <strong>こんな人生だった</strong>
          <p>{persona.biography}</p>
          {persona.history && (
            <ol className="persona-timeline">
              {persona.history.map((item) => <li key={item}>{item}</li>)}
            </ol>
          )}
        </div>
        <p className="persona-instruction">この人物になったつもりで、函館のデータを見てみましょう。</p>
        <div className="persona-actions">
          <button type="button" onClick={() => navigate(`/persona/${persona.id}/guided`)}>
            <span>おすすめ</span>
            <strong>問いからデータを見る</strong>
            <small>会場と同じグラフを、人物の視点から考える</small>
          </button>
          <button type="button" className="secondary" onClick={() => navigate(`/persona/${persona.id}/explore`)}>
            <strong>自由にデータを見る</strong>
            <small>好きなグラフを選び、気になる場所に付箋を貼る</small>
          </button>
        </div>
      </section>
    </main>
  );
}
