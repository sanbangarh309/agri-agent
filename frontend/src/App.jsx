import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AgriAgent() {
  const [question, setQuestion] = useState("");
  const [location, setLocation] = useState("Kurukshetra, Haryana");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("agri_theme") || "dark"
  );

  const API_BASE = "https://api-agri-agent.aryaorganicfarm.com";

  useEffect(() => {
    localStorage.setItem("agri_theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  const ask = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setReply("");

    const sessionId =
      localStorage.getItem("agri_session_id") || crypto.randomUUID();
    localStorage.setItem("agri_session_id", sessionId);

    const res = await fetch(`${API_BASE}/api/agri/${sessionId}`, {
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
        background: isDark
          ? "radial-gradient(circle at top, #1f2933, #0b0f14)"
          : "linear-gradient(135deg, #eef2ff, #f8fafc)",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: 20,
          height: "calc(100vh - 40px)",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            background: isDark ? "#0f172a" : "#ffffff",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            color: isDark ? "#e5e7eb" : "#0f172a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header with Theme Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h2 style={{ margin: 0 }}>🌾 Agri Advisor</h2>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title="Toggle theme"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>

          <label style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#475569" }}>
            Location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #cbd5f5",
              background: isDark ? "#020617" : "#f8fafc",
              color: isDark ? "#e5e7eb" : "#0f172a",
              outline: "none",
              marginBottom: 10,
            }}
          />

          <label style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#475569" }}>
            Your Question
          </label>
          <textarea
            rows={6}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #cbd5f5",
              background: isDark ? "#020617" : "#f8fafc",
              color: isDark ? "#e5e7eb" : "#0f172a",
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
                ? "#86efac"
                : "linear-gradient(135deg, #16a34a, #22c55e)",
              color: "#022c22",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Thinking..." : "Ask Advisor"}
          </button>
        </div>

        {/* Output Panel */}
        <div
          style={{
            background: isDark ? "#020617" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            color: isDark ? "#e5e7eb" : "#0f172a",
            overflow: "auto",
          }}
        >
          {reply ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {reply}
            </ReactMarkdown>
          ) : (
            <div style={{ color: isDark ? "#64748b" : "#475569" }}>
              Ask a question to see advice here…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}