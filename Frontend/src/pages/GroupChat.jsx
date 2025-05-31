// src/components/GroupChat.jsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { API_CALL_PREFIX } from "../../config.js";
import { SOCKET_SERVER_URL } from "../../config.js";
const socket = io(SOCKET_SERVER_URL);

export default function GroupChat() {
  const { groupId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  console.log(groupInfo);
  const token = localStorage.getItem("token");

  // Fetch group info and messages
  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const res = await fetch(`${API_CALL_PREFIX}/backend/groups/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ groupId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error);
        setGroupInfo(data);
      } catch (err) {
        console.error("Error fetching group info:", err);
        setError("Failed to load group information");
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_CALL_PREFIX}/backend/groupmessage/get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ grpID: groupId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupInfo();
      fetchMessages();

      // Join the group socket room
      socket.emit("joinGroup", groupId);
    }

    return () => {
      // Clean up socket listeners when component unmounts
      socket.off("newGroupMessage");
      socket.off("groupMessageUpdated");
      socket.off("groupMessageDeleted");
    };
  }, [groupId]);

  // Listen for new messages
  useEffect(() => {
    socket.on("newGroupMessage", (message) => {
      if (message.group === groupId) {
        // Make sure the message has the complete sender object
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    socket.on("groupMessageUpdated", ({ messageId, newMessage }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, message: newMessage } : msg
        )
      );
    });

    socket.on("groupMessageDeleted", (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    });

    return () => {
      socket.off("newGroupMessage");
      socket.off("groupMessageUpdated");
      socket.off("groupMessageDeleted");
    };
  }, [groupId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    // Emit the message through socket.io
    socket.emit("sendGroupMessage", {
      sender: currentUser._id,
      groupId,
      message: newMessage,
    });

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleEditMessage = (messageId, newText) => {
    socket.emit("editGroupMessage", {
      messageId,
      newMessage: newText,
      userId: currentUser._id,
    });
  };

  const handleDeleteMessage = (messageId) => {
    socket.emit("deleteGroupMessage", {
      messageId,
      userId: currentUser._id,
    });
  };

  // Function to format date for display
  const formatMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset hours to compare just the dates
    const messageDay = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate()
    );
    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayDay = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (messageDay.getTime() === todayDay.getTime()) {
      return "Today";
    } else if (messageDay.getTime() === yesterdayDay.getTime()) {
      return "Yesterday";
    } else {
      // Format like "Wed, May 21"
      return messageDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp || message.createdAt);
      const dateString = new Date(
        messageDate.getFullYear(),
        messageDate.getMonth(),
        messageDate.getDate()
      ).toISOString();

      if (dateString !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            displayDate: formatMessageDate(
              currentGroup[0].timestamp || currentGroup[0].createdAt
            ),
            messages: currentGroup,
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
        displayDate: formatMessageDate(
          currentGroup[0].timestamp || currentGroup[0].createdAt
        ),
        messages: currentGroup,
      });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (loading) {
    return (
      <div className="min-h-screen bg-base text-text-primary flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-serif text-text-secondary">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base text-text-primary flex items-center justify-center p-4">
        <div className="bg-bg-secondary p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-serif text-error mb-4">Error</h2>
          <p className="text-error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col font-sans">
      {/* Header */}
      <header className="bg-bg-secondary shadow-md p-4 sticky top-0 z-10 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center">
          {/* Back button - you might want to implement navigation */}
          {/* <button className="mr-4 text-text-secondary hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button> */}
          {groupInfo?.groupName ? (
            <h1 className="text-2xl font-serif text-text-primary text-center">
              {groupInfo.groupName}
            </h1>
          ) : (
            <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse"></div> // Placeholder for group name
          )}
          {/* You can add more group info or actions here, like member count or settings */}
        </div>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-grow overflow-y-auto p-6 space-y-6 bg-base">
        <div className="max-w-4xl mx-auto">
          {messageGroups.map((group) => (
            <div key={group.date} className="mb-4">
              {/* Date Separator */}
              <div className="flex items-center my-4">
                <hr className="flex-grow border-t border-border" />
                <span className="px-3 text-xs text-text-secondary font-medium bg-base">
                  {group.displayDate}
                </span>
                <hr className="flex-grow border-t border-border" />
              </div>

              {/* Messages in this date group */}
              <div className="space-y-3">
                {group.messages.map((msg) => {
                  const isCurrentUser = msg.sender._id === currentUser._id;
                  // Basic check for valid sender - adjust as per your data structure
                  const senderUsername = msg.sender?.username || "Unknown User";
                  const senderAvatar = msg.sender?.avatar;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xl px-5 py-3 rounded-xl shadow-md ${isCurrentUser 
                            ? "bg-primary text-bg rounded-br-none"
                            : "bg-bg-secondary text-text-primary rounded-bl-none border border-border"}`}
                      >
                        <div className="flex items-center mb-1">
                          {!isCurrentUser && (
                            senderAvatar ? (
                              <img src={senderAvatar} alt={senderUsername} className="w-6 h-6 rounded-full mr-2 border border-border" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center mr-2 text-xs text-bg font-serif">
                                {senderUsername.charAt(0).toUpperCase()}
                              </div>
                            )
                          )}
                          <p className={`text-xs font-medium ${isCurrentUser ? "text-bg opacity-80" : "text-accent"}`}>
                            {isCurrentUser ? "You" : senderUsername}
                          </p>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? "text-bg opacity-70 text-right" : "text-text-secondary text-left"}`}>
                          {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {/* TODO: Add edit/delete options here, visible based on permissions */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* For auto-scrolling */}
        </div>
      </main>

      {/* Message Input Area */}
      <footer className="bg-bg-secondary p-4 sticky bottom-0 z-10 border-t border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-grow p-3 bg-bg border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-lg transition-all duration-300 ease-in-out shadow-sm text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-primary text-bg hover:bg-accent-hover rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
