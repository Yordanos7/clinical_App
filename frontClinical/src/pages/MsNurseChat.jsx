import { useState, useRef, useEffect } from "react";

export default function MsNurseChat() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChatLog((prev) => [...prev, { sender: "user", text: message }]);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/msnurse/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.reply) {
        setChatLog((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setChatLog((prev) => [
          ...prev,
          { sender: "ai", text: "Sorry, no response from AI." },
        ]);
      }
    } catch (error) {
      setChatLog((prev) => [
        ...prev,
        { sender: "ai", text: "Error connecting to server." },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <div
        style={{
          border: "1px solid #ccc",
          height: 400,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
          backgroundColor: "#f9f9f9",
        }}
      >
        {chatLog.length === 0 && (
          <p style={{ color: "#666" }}>
            Ask Ms. Nurse AI your medical questions...
          </p>
        )}
        {chatLog.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 15px",
                borderRadius: 20,
                backgroundColor: msg.sender === "user" ? "#4caf50" : "#e0e0e0",
                color: msg.sender === "user" ? "white" : "black",
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <textarea
        rows={3}
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          borderRadius: 5,
          border: "1px solid #ccc",
          resize: "none",
          boxSizing: "border-box",
          marginBottom: 10,
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          borderRadius: 5,
          border: "none",
          backgroundColor: "#4caf50",
          color: "white",
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </div>
  );
}
