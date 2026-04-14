import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Upload from "./Upload";

function Chat({ token, logout }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! Upload a file above, and select a mode to begin." }
  ]);
  const [fileId, setFileId] = useState(null);
  const [mode, setMode] = useState("qa");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const ask = async () => {
    if (!fileId && mode !== "qa") {
      return alert("Please upload a file to generate notes/mcqs/etc.");
    }
    if (mode === "qa" && !question.trim()) {
      return alert("Please ask a question.");
    }

    // Optimistic UI update
    const promptText = mode === "qa" ? question : `Generate ${mode}...`;
    setMessages((prev) => [...prev, { role: "user", text: promptText }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/ask/",
        {
          file_id: fileId,
          question: promptText,
          mode: mode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
      } else {
        alert("An error occurred while fetching the response. Did you forget to upload a file?");
      }
      // Remove optimistic message if error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2 style={{ margin: 0 }}>PrepGenius AI Dashboard</h2>
        <button className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }} onClick={logout}>
          Logout
        </button>
      </div>

      <Upload token={token} setFileId={setFileId} />

      <div className="chat-actions">
        {["qa", "notes", "mcq", "flashcards", "interview"].map((m) => (
          <button
            key={m}
            className={`mode-btn ${mode === m ? "active" : ""}`}
            onClick={() => setMode(m)}
          >
            {m === "qa" ? "Q&A" : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role === "user" ? "user" : "ai"}`}>
            <p style={{ whiteSpace: "pre-line", margin: 0 }}>{m.text}</p>
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <p style={{ margin: 0, opacity: 0.7 }}>Thinking...</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-wrapper">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder={mode === "qa" ? "Ask something about your file..." : `Click Send to generate ${mode}`}
          disabled={loading || (mode !== "qa" && !fileId)}
        />
        <button className="btn btn-primary" onClick={ask} disabled={loading || (mode !== "qa" && !fileId)}>
          {loading ? "Wait..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Chat;