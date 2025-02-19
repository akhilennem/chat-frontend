import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatHome.css";
import { useNavigate } from "react-router-dom";
const url = "https://m4vx17k1-5000.inc1.devtunnels.ms/";

const ChatHome = ({ openChat }) => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch chat list
    const fetchChats = async () => {
      try {
        const response = await axios.get(url + "user/chats");
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/user/get-users?email=${query}`);
      if (response.data.success) {
        setSearchResults(response.data.users);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    }
  };

  const handleOpenChat = (email) => {
    console.log('email ',email)
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
              {user.name} {/* Assuming the user object has an email field */}
            </div>
          ))}
        </div>
      )}

      <div className="chat-list">
        {chats.length === 0 ? (
          <p>No chats available</p>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="chat-item" onClick={() => openChat(chat)}>
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