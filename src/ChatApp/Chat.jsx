import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import "./Chat.css";
import { useNavigate, useParams } from "react-router-dom";

const url = "http://localhost:5000/";

const socket = io(url, {
  query: { userEmail: localStorage.getItem("userEmail") },
  autoConnect: true,
  reconnection: true,
});

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketId, setSocketId] = useState("");
  const [chatID, setChatID] = useState("");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const { email } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected with socket ID:", socket.id);
      setSocketId(socket.id);
    });

    socket.on("receive_message", (data) => {
      console.log("Received message:", data);

      if (
        (data.user === userEmail && data.to === email) ||
        (data.user === email && data.to === userEmail)
      ) {
        setChatID(data.chatID);
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [email, userEmail]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${url}user/messages?from=${userEmail}&to=${email}`
        );
        setMessages(response.data);

        if (response.data.length > 0) {
          setChatID(response.data[0].chatID);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [email, userEmail]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      message: message,
      sender: socketId,
      chatID: chatID || `${userEmail}_${email}`,
      user: userEmail,
      to: email,
      createdAt: new Date().toISOString(),
    };

    socket.emit("send_message", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");
  };

  // 🔹 Helper: Format Date Heading
  const formatDateHeading = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dateStr = date.toDateString();

    if (dateStr === today.toDateString()) return "Today";
    if (dateStr === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 🔹 Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  return (
    <div className="chat-container">
      <div className="chat-header">
        <FaArrowLeft className="back-button" onClick={() => navigate("/chatHome")} />
        <h2>Welcome, {userName}!</h2>
      </div>

<div className="chat-box">
  {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
    <div key={dateKey}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "10px 0",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            color: "#444",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: "500",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          {formatDateHeading(dateKey)}
        </div>
      </div>

      {msgs.map((msg, index) => (
        <div
          key={index}
          className={`message-container ${
            msg.user === userEmail ? "my-message-container" : ""
          }`}
        >
          <p
            className={`message-text ${
              msg.user === userEmail ? "my-message" : "other-message"
            }`}
          >
            {msg.message}
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#999",
                marginTop: "4px",
                textAlign: "right",
              }}
            >
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>
      ))}
    </div>
  ))}
</div>

      <div className="input-container">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chat;
