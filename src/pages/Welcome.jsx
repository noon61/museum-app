import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  const questions = [
    "「データ」と聞いて最初に思い浮かぶ言葉は？",
    "あなたは「データ」をどのようなものだと思いますか？",
    "「統計表」はいつから作られたと思いますか？",
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#B5AA9E",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "1100px",
          background: "#fff",
          borderRadius: "40px",
          padding: "60px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            color: "#4A2615",
            marginBottom: "50px",
          }}
        >
          聞かせて！あなたのアイデア
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "24px",
            marginBottom: "40px",
          }}
        >
          あなたの答えが、この展示の一部になります。
          <br />
          気になる問いを選んでください。
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
          }}
        >
          {questions.map((question) => (
            <div
              key={question}
              onClick={() =>
                navigate("/input", {
                  state: {
                    question,
                  },
                })
              }
              style={{
                background: "#F7EFE8",
                borderRadius: "25px",
                padding: "35px",
                cursor: "pointer",
                fontSize: "28px",
                color: "#4A2615",
                transition: ".3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {question}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}