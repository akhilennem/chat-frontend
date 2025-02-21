import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./ChatHome.css";

const url = "http://localhost:5000/";
const socket = io(url); // Connect to Socket.IO

const ChatHome = ({ openChat }) => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${url}user/get-dashboard?email=${userEmail}`);
        if (response.data.success) {
          const chatMap = new Map();

          response.data.dashboard.forEach((chat) => {
            const sender = chat.fromuser[0];

            if (sender && !chatMap.has(sender.email)) {
              const lastMessage =
                chat.usermessages?.length > 0
                  ? chat.usermessages[chat.usermessages.length - 1].message || "No messages"
                  : "No messages";

              chatMap.set(sender.email, {
                id: chat._id,
                name: sender.name || "Unknown",
                email: sender.email || "Unknown",
                lastMessage,
              });
            }
          });

          setChats(Array.from(chatMap.values()));
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();

    // Listen for new messages and update the chat list
    socket.on("newMessage", (newMessage) => {
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex((chat) => chat.email === newMessage.senderEmail);

        if (chatIndex !== -1) {
          updatedChats[chatIndex].lastMessage = newMessage.message;
        } else {
          updatedChats.unshift({
            id: newMessage.chatId,
            name: newMessage.senderName,
            email: newMessage.senderEmail,
            lastMessage: newMessage.message,
          });
        }

        return updatedChats;
      });
    });

    return () => {
      socket.off("newMessage"); // Clean up listener
    };
  }, [userEmail]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`${url}user/get-users?email=${query}`);
      setSearchResults(response.data.success ? response.data.users : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    }
  };

  const handleOpenChat = (email) => {
    navigate(`/chat/${email}`);
  };

  return (
    <div className="chat-home-container">
      <input
        type="text"
        placeholder="Search by email..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-bar"
      />

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((user) => (
            <div key={user._id} className="search-item" onClick={() => handleOpenChat(user.email)}>
              {user.name}
            </div>
          ))}
        </div>
      )}

      <div className="chat-list">
        {chats.length === 0 ? (
          <p>No chats available</p>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="chat-item" onClick={() => handleOpenChat(chat.email)}>
              <p>{chat.name}</p>
              <span className="last-message">{chat.lastMessage}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHome;
