import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Chat() {
  const { friendId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [friend, setFriend] = useState(null);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch(`/backend/messages/${friendId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error loading chat:", err);
      }
    };

    const fetchFriendDetails = async () => {
      try {
        const res = await fetch("/backend/friend/get-friends", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        const friendData = data.find((friend) => friend._id === friendId);
        setFriend(friendData);
      } catch (err) {
        console.error("Error fetching friend details:", err);
      }
    };

    fetchChat();
    fetchFriendDetails();

    socket.emit("join", currentUser._id);

    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [friendId, currentUser]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      sender: currentUser._id,
      receiver: friendId,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]); 
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">
        {friend ? `Chat with ${friend.username}` : "Loading..."}
      </h1>
      <div className="bg-gray-800 p-4 h-96 overflow-y-auto rounded-md">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 rounded-md text-sm ${
              msg.sender === currentUser._id
                ? "bg-blue-500 ml-auto"
                : "bg-gray-700 mr-auto"
            }`}
          >
            <p>{msg.message}</p>
            <p className="text-gray-400 text-xs mt-1">
              {new Date(msg.timestamp).toLocaleString()}{" "}
              {/* Format Date and Time */}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
