import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
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
    <div className="min-h-screen bg-bg text-text-primary p-4 md:p-6 font-serif flex flex-col">
      <div className="flex items-center border-b border-secondary pb-4 mb-6">
        {friend && (
          <img 
            src={friend.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
            alt={friend.username} 
            className="w-12 h-12 rounded-full mr-4 border-2 border-secondary shadow-sm"
          />
        )}
        <h1 className="text-2xl font-semibold text-primary">
          {friend ? friend.username : "Loading Chat..."}
        </h1>
      </div>
      
      <div className="bg-bg border border-secondary p-4 flex-grow overflow-y-auto rounded-lg shadow-md flex flex-col space-y-4 mb-4">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <div className="flex justify-center my-3">
              <div className="bg-primary/80 text-bg text-xs px-4 py-1.5 rounded-full shadow-sm">
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
                    className={`max-w-md lg:max-w-lg p-3 rounded-xl shadow-sm text-sm break-words ${
                      isSender 
                        ? "bg-primary text-bg rounded-br-none ml-auto" 
                        : "bg-secondary text-bg rounded-bl-none mr-auto"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-1.5 text-right ${isSender ? 'text-bg/70' : 'text-bg/70'}`}>
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
      
      <div className="flex mt-auto items-center gap-3 p-3 bg-bg border-t border-secondary rounded-b-lg shadow-md">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-3 bg-bg border border-secondary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-bg px-6 py-3 rounded-lg hover:bg-accent transition shadow-sm focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
}