import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./ChatHome.css";

const url = "http://localhost:5000/";
const socket = io(url);

const ChatHome = () => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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
      socket.off("newMessage");
    };
  }, [userEmail]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      setSelectedUser(null);
      return;
    }
    try {
      const response = await axios.get(`${url}user/get-users?email=${query}`);
      if (response.data.success) {
        setSearchResults(response.data.users);
        setSelectedUser(response.data.users.length > 0 ? response.data.users[0] : null);
      } else {
        setSearchResults([]);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
      setSelectedUser(null);
    }
  };

  // Open chat when clicking on the card
  const handleOpenChat = (email) => {
    console.log("Navigating to chat:", email);
    navigate(`/chat/${encodeURIComponent(email)}`);
  };

  // Close the selected user when clicking ❌
  const handleCloseSelectedUser = (e) => {
    e.stopPropagation(); // Prevents click from opening chat
    setSelectedUser(null);
  };

  return (
    <div className="chat-home-container">
      {/* Search Bar Container */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />

        {/* Searched Email Card */}
        {selectedUser && (
          <div className="search-result-card" onClick={() => handleOpenChat(selectedUser.email)}>
            <p>{selectedUser.name} ({selectedUser.email})</p>
            <button className="close-card" onClick={handleCloseSelectedUser}>
              ❌
            </button>
          </div>
        )}
      </div>

      {/* Chat List */}
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
