import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import "./Chat.css";

// const url = 'http://localhost:5000/';
const url="https://m4vx17k1-5000.inc1.devtunnels.ms/"
const socket = io.connect(url);

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [myMessages, setmyMessages] = useState([]);
  const [socketId, setSocketId] = useState("");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    // Initialize socket connection
    socket.on("connect", () => {
      console.log("Connected with socket ID:", socket.id);
      setSocketId(socket.id);
    });

    // Handle incoming messages
    const handleMessage = (data) => {
      console.log("Received message from server:", data);
      
      setMessages(prevMessages => {
        // Prevent duplicates
        if (!prevMessages.some(msg => msg.message === data.message && msg.user === data.user)) {
          return [...prevMessages, data];
        }
        return prevMessages;
      });
    };
    

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [userName]);

  useEffect(() => {
    // Fetch old messages when component loads
    const fetchMessages = async () => {
      try {
        const response = await axios.get(url+"user/messages");
        
        // Filter messages by matching username
        const filteredMessages = response.data.filter(msg => msg.user != userName);
        setMessages(filteredMessages);
        const filteredMyMessages = response.data.filter(msg => msg.user === userName);
        setmyMessages(filteredMyMessages)
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      message: message,
      sender: socketId,
      user: userName,
      email: userEmail
    };
  
    // Emit message to server
    socket.emit("send_message", newMessage);
  
    setMessage(""); // Clear input field
  };
  
  
  // Modify handleMessage to include all messages
  const handleMessage = (data) => {
    console.log("Received message from server:", data);
    
    setMessages(prevMessages => {
      if (!prevMessages.some(msg => msg.message === data.message && msg.user === data.user)) {
        return [...prevMessages, data];
      }
      return prevMessages;
    });
  };
  
  // Listen for messages
  useEffect(() => {
    socket.on("receive_message", handleMessage);
  
    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, []);
  
  
  // Listen for messages
  useEffect(() => {
    // Fetch old messages when component loads
    const fetchMessages = async () => {
      try {
        const response = await axios.get(url+"user/messages");
        
        // Store ALL messages in `messages` state
        setMessages(response.data);  
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
  
    fetchMessages();
  }, []);
  
  
  

  return (
    <div className="chat-container">
      <h2>Welcome, {userName}!</h2>
      <div className="chat-box">
        {messages.map((msg, index) => {
          const showUserName = index === 0 || messages[index - 1].user !== msg.user;
          
          return (
            <div 
              key={index} 
              className={`message-container ${msg.user === userName ? "my-message-container" : ""}`}
            >
              {showUserName && msg.user !== userName && <p className="user-name">{msg.user}</p>}
              <p className={`message-text ${msg.user === userName ? "my-message" : "other-message"}`}>
                {msg.message}
              </p>
            </div>
          );
        })}
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
}  

export default Chat;
