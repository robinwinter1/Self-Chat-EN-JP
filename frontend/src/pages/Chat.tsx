import { useState, useEffect, useRef } from "react";
import axios from "axios";

type Message = {
  _id: string;
  sender: "A" | "B";
  textEnglish: string;
  textJapanese: string;
  timestamp: string;
};

const AUTO_DELETE_SECONDS = 1800; // 30 min

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [textEnglish, setTextEnglish] = useState("");
  const [textJapanese, setTextJapanese] = useState("");
  const [sender, setSender] = useState<"A" | "B">("A");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEnglish, setEditEnglish] = useState("");
  const [editJapanese, setEditJapanese] = useState("");

  const [error, setError] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/messages");
      setMessages(res.data);
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!textEnglish.trim() || !textJapanese.trim()) {
      setError("Please fill in both English and Japanese.");
      return;
    }

    try {
      setError("");
      await axios.post("http://localhost:5000/api/messages", {
        sender,
        textEnglish,
        textJapanese,
      });
      setTextEnglish("");
      setTextJapanese("");
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const saveEdit = async (id: string) => {
    if (!editEnglish.trim() || !editJapanese.trim()) return;

    try {
      await axios.put(`http://localhost:5000/api/messages/${id}`, {
        textEnglish: editEnglish,
        textJapanese: editJapanese,
      });
      setEditingId(null);
      setEditEnglish("");
      setEditJapanese("");
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const getRemainingTime = (timestamp: string) => {
    const created = new Date(timestamp).getTime();
    const now = Date.now();
    const remainingSec = Math.max(
      0,
      AUTO_DELETE_SECONDS - Math.floor((now - created) / 1000),
    );
    const minutes = Math.floor(remainingSec / 60);
    const seconds = remainingSec % 60;
    return `${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    const countdown = setInterval(() => setMessages((prev) => [...prev]), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Self Chat (EN/JP)</h1>

      {/* Side switch */}
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
      >
        {["A", "B"].map((s) => (
          <button
            key={s}
            onClick={() => setSender(s as "A" | "B")}
            style={{
              background: sender === s ? "#4f46e5" : "#ddd",
              color: sender === s ? "white" : "black",
              padding: "6px 12px",
              borderRadius: 5,
              border: "none",
              margin: "0 5px",
              cursor: "pointer",
            }}
          >
            Side {s}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div
        ref={chatContainerRef}
        style={{
          border: "1px solid #ccc",
          borderRadius: 10,
          height: 400,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
          background: "#f9f9f9",
        }}
      >
        {messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m._id}
              style={{
                display: "flex",
                justifyContent: m.sender === "A" ? "flex-start" : "flex-end",
                marginBottom: 10,
              }}
            >
              {editingId === m._id ? (
                <div style={{ width: "70%" }}>
                  <input
                    value={editEnglish}
                    onChange={(e) => setEditEnglish(e.target.value)}
                    placeholder="English"
                    style={{
                      width: "100%",
                      marginBottom: 5,
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #4f46e5",
                    }}
                  />
                  <input
                    value={editJapanese}
                    onChange={(e) => setEditJapanese(e.target.value)}
                    placeholder="Japanese"
                    style={{
                      width: "100%",
                      marginBottom: 5,
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #4f46e5",
                    }}
                  />
                  <div style={{ display: "flex", gap: 5 }}>
                    <button
                      onClick={() => saveEdit(m._id)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 5,
                        background: "#4f46e5",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 5,
                        background: "#ccc",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ position: "relative", maxWidth: "70%" }}>
                  <div
                    style={{
                      borderRadius: 15,
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => {
                      setEditingId(m._id);
                      setEditEnglish(m.textEnglish);
                      setEditJapanese(m.textJapanese);
                    }}
                  >
                    <div
                      style={{
                        background: m.sender === "A" ? "#e5e7eb" : "#2563eb",
                        color: m.sender === "A" ? "black" : "white",
                        padding: "8px 12px",
                      }}
                    >
                      {m.textEnglish}
                    </div>
                    <div
                      style={{
                        background: m.sender === "A" ? "#f3f4f6" : "#1d4ed8",
                        color: m.sender === "A" ? "black" : "white",
                        padding: "8px 12px",
                      }}
                    >
                      {m.textJapanese}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: "#888",
                      marginTop: 2,
                      textAlign: m.sender === "A" ? "left" : "right",
                    }}
                  >
                    Auto-delete in {getRemainingTime(m.timestamp)}
                  </div>

                  <button
                    onClick={async () => {
                      if (confirm("Delete this message?")) {
                        await axios.delete(
                          `http://localhost:5000/api/messages/${m._id}`,
                        );
                        fetchMessages();
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: -5,
                      right: m.sender === "A" ? -25 : "auto",
                      left: m.sender === "B" ? -25 : "auto",
                      background: "transparent",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "#888" }}>
            No messages yet
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={textEnglish}
          onChange={(e) => {
            setTextEnglish(e.target.value);
            setError("");
          }}
          placeholder="English"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />

        <input
          value={textJapanese}
          onChange={(e) => {
            setTextJapanese(e.target.value);
            setError("");
          }}
          placeholder="Japanese"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />

        {error && <div style={{ color: "#dc2626", fontSize: 13 }}>{error}</div>}

        <button
          onClick={sendMessage}
          style={{
            padding: "10px 15px",
            borderRadius: 10,
            background: "#4f46e5",
            color: "white",
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-end",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
