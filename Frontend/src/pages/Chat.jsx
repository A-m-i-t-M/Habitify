import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import SideBar from "../../components/SideBar";

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
    <div className="flex min-h-screen bg-black text-white">
      <SideBar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center">
          {friend && friend.avatar && (
            <img 
              src={friend.avatar} 
              alt={friend.username} 
              className="w-8 h-8 rounded-full mr-3 border border-white/20"
            />
          )}
          <h1 className="text-lg font-light tracking-wider">
            {friend ? friend.username : "Loading..."}
          </h1>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messageGroups.map((group, groupIndex) => (
              <motion.div 
                key={groupIndex} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex justify-center my-4">
                  <div className="px-3 py-1 border border-white/10 rounded-full">
                    <span className="text-xs text-white/50 tracking-wider">{group.displayDate}</span>
                  </div>
                </div>
                
                {group.messages.map((msg, msgIndex) => {
                  const isSender = msg.sender === currentUser._id;
                  return (
                    <motion.div 
                      key={msgIndex} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: msgIndex * 0.05 }}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md p-3 ${
                          isSender 
                            ? "bg-white text-black ml-12" 
                            : "bg-white/10 text-white mr-12"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 text-right ${isSender ? 'text-black/50' : 'text-white/50'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}