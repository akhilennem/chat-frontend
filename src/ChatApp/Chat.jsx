import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import "./Chat.css";
import { useNavigate, useParams } from "react-router-dom";

const url = "http://localhost:5000/";
// const url="https://m4vx17k1-5000.inc1.devtunnels.ms/"

// 🔹 Move socket connection OUTSIDE component (to prevent re-creation on every render)
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

  // 🔹 Socket connection & message listener (Runs **Once**)
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected with socket ID:", socket.id);
      setSocketId(socket.id);
    });

    socket.on("receive_message", (data) => {
      console.log("Received message:", data);
      setChatID(data.chatID);

      setMessages((prevMessages) => [...prevMessages, data]); // 🔹 Append new message to state
    });

    return () => {
      socket.off("receive_message"); // 🔹 Clean up listener on unmount
    };
  }, []);

  // 🔹 Fetch previous chat messages from DB when component loads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${url}user/messages?from=${userEmail}&to=${email}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [email, userEmail]); // Runs when email/userEmail changes

  // 🔹 Send Message Function
  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      message: message,
      sender: socketId,
      chatID: chatID, // Ensure correct chatID
      user: userEmail,
      to: email,
    };

    socket.emit("send_message", newMessage); // 🔹 Emit message

    setMessages((prevMessages) => [...prevMessages, newMessage]); // 🔹 Update UI immediately
    setMessage(""); // Clear input field
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <FaArrowLeft className="back-button" onClick={() => navigate("/chatHome")} />
        <h2>Welcome, {userName}!</h2>
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message-container ${msg.user === userEmail ? "my-message-container" : ""}`}>
            <p className={`message-text ${msg.user === userEmail ? "my-message" : "other-message"}`}>
              {msg.message}
            </p>
          </div>
        ))}
      </div>

      <div className="input-container">
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
        <button onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chat;
