import React, { useState } from "react";
import axios from "axios";
import Upload from "./Upload";

function Chat({ token }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [mode, setMode] = useState("qa");

  const ask = async () => {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/ask/",
      {
        file_id: fileId,
        question: question,
        mode: mode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessages([
      ...messages,
      { role: "user", text: question },
      { role: "ai", text: res.data.answer },
    ]);

    setQuestion("");
  };

  return (
    <div>
      <h2>PrepGenius AI 🤖</h2>

      <Upload token={token} setFileId={setFileId} />

      <div>
        <button onClick={() => setMode("qa")}>Q&A</button>
        <button onClick={() => setMode("notes")}>Notes</button>
        <button onClick={() => setMode("mcq")}>MCQ</button>
        <button onClick={() => setMode("flashcards")}>Flashcards</button>
      </div>

      <div style={{ height: "300px", overflowY: "scroll", border: "1px solid gray" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.role === "user" ? "You" : "AI"}:</b>
            <p style={{ whiteSpace: "pre-line" }}>{m.text}</p>
          </div>
        ))}
      </div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
      />

      <button onClick={ask}>Send</button>
    </div>
  );
}

export default Chat;