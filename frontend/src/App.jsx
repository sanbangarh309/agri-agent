import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AgriAgent() {
  const [question, setQuestion] = useState("");
  const [location, setLocation] = useState("Kurukshetra, Haryana");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setReply("");

    const sessionId =
      localStorage.getItem("agri_session_id") || crypto.randomUUID();
    localStorage.setItem("agri_session_id", sessionId);

    const res = await fetch(`http://localhost:5000/api/agri/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, location }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const events = chunk.split("\n\n").filter(Boolean);

      for (const evt of events) {
        if (!evt.startsWith("data: ")) continue;
        const payload = JSON.parse(evt.replace("data: ", ""));

        if (payload.done) {
          setLoading(false);
          return;
        }

        if (payload.token) {
          full += payload.token;
          setReply(full);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "radial-gradient(circle at top, #1f2933, #0b0f14)",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Outer container for ultra-wide screens */}
      <div
        style={{
          maxWidth: 1400,              // 👈 cap width for readability
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "360px 1fr", // 👈 left input, right output
          gap: 20,
          height: "calc(100vh - 40px)",
        }}
      >
        {/* Left: Input Panel */}
        <div
          style={{
            background: "#0f172a",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            color: "#e5e7eb",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 12 }}>
            🌾 Agri Advisor
          </h2>

          <label style={{ fontSize: 12, color: "#9ca3af" }}>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Kurukshetra, Haryana"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#020617",
              color: "#e5e7eb",
              outline: "none",
              marginBottom: 10,
            }}
          />

          <label style={{ fontSize: 12, color: "#9ca3af" }}>Your Question</label>
          <textarea
            rows={6}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about crops, pests, irrigation, selling produce..."
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#020617",
              color: "#e5e7eb",
              outline: "none",
              resize: "vertical",
              flexGrow: 1,
            }}
          />

          <button
            onClick={ask}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: loading
                ? "#14532d"
                : "linear-gradient(135deg, #16a34a, #22c55e)",
              color: "#ecfdf5",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: 0.3,
            }}
          >
            {loading ? "Thinking..." : "Ask Advisor"}
          </button>
        </div>

        {/* Right: Output Panel */}
        <div
          style={{
            background: "#020617",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            color: "#e5e7eb",
            overflow: "auto",            // 👈 scroll for long answers
          }}
        >
          {reply ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ node, ...props }) => (
                  <h2 style={{ color: "#86efac", marginTop: 16 }} {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li style={{ marginLeft: 18, marginBottom: 4 }} {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p style={{ lineHeight: 1.7, marginBottom: 10 }} {...props} />
                ),
              }}
            >
              {reply}
            </ReactMarkdown>
          ) : (
            <div style={{ color: "#64748b" }}>
              Ask a question to see advice here…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}