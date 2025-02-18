import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import "./Chat.css";

const url='https://chat-backend-qh64.onrender.com/'
// const url='http://localhost:5000/'

const socket = io.connect(url); // Ensure the backend is running on port 5000

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
    // Fetch old messages when the component loads
    const fetchMessages = async () => {
      try {
        const response = await axios.get(url); // Adjust API URL if needed
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Listen for connection event
    socket.on("connect", () => {
      console.log("Connected with socket ID:", socket.id);
      setSocketId(socket.id);
    });

    // Listen for real-time messages from other users
    socket.on("receive_message", (data) => {
      console.log("Received message from server:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = { text: message, sender: socketId }; // Use socket ID as sender
    socket.emit("send_message", newMessage); // Send message to backend

    setMessage(""); // Clear input field
  };

  return (
    <div className="chat-container">
      <h2>Chat App</h2>
      <p>Socket ID: <strong>{socketId}</strong></p>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === socketId ? "my-message" : "other-message"}>
            {msg.text}
          </p>
        ))}
      </div>
      <div className="input-container">
        <input 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}><FaPaperPlane /></button>
      </div>
    </div>
  );
};

export default Chat;
