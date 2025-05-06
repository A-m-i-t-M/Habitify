import  { useEffect, useState, useRef } from "react";
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
        console.error("Error fetching friend detail:", err);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  // Function to format date for display
  const formatMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset hours to compare just the dates
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (messageDay.getTime() === todayDay.getTime()) {
      return "Today";
    } else if (messageDay.getTime() === yesterdayDay.getTime()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];
    
    messages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      const dateString = new Date(
        messageDate.getFullYear(),
        messageDate.getMonth(),
        messageDate.getDate()
      ).toISOString();
      
      if (dateString !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            displayDate: formatMessageDate(currentGroup[0].timestamp),
            messages: currentGroup
          });
        }
        currentDate = dateString;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        displayDate: formatMessageDate(currentGroup[0].timestamp),
        messages: currentGroup
      });
    }
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center border-b border-gray-700 pb-3 mb-4">
        {friend && friend.profilePic && (
          <img 
            src={friend.profilePic} 
            alt={friend.username} 
            className="w-10 h-10 rounded-full mr-3"
          />
        )}
        <h1 className="text-xl font-bold">
          {friend ? friend.username : "Loading..."}
        </h1>
      </div>
      
      <div className="bg-gray-800 p-4 h-96 overflow-y-auto rounded-md flex flex-col space-y-3">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <div className="flex justify-center my-2">
              <div className="bg-gray-700 text-gray-300 text-xs px-4 py-1 rounded-full">
                {group.displayDate}
              </div>
            </div>
            
            {group.messages.map((msg, msgIndex) => {
              const isSender = msg.sender === currentUser._id;
              return (
                <div 
                  key={msgIndex} 
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                      isSender 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-gray-700 text-white rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className={`text-xs mt-1 text-right ${isSender ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex mt-4 items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-3 rounded-r-md hover:bg-blue-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
}