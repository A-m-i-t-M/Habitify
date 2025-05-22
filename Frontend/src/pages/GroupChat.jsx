// src/components/GroupChat.jsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import SideBar from "../../components/SideBar";

const socket = io("http://localhost:3000");

export default function GroupChat() {
  const { groupId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch group info and messages
  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const res = await fetch("/backend/groups/members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
        const res = await fetch("/backend/groupmessage/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
      <div className="flex min-h-screen bg-black text-white items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-black text-white items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <SideBar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 mr-3 text-sm font-light">
            {groupInfo?.groupName?.charAt(0) || "G"}
          </div>
          <div>
            <h1 className="text-lg font-light tracking-wider">
              {groupInfo ? groupInfo.groupName : "Loading..."}
            </h1>
            <p className="text-xs text-white/50">
              {groupInfo ? `${groupInfo.members.length} members` : ""}
            </p>
          </div>
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
                  const isSender =
                    msg.sender?._id === currentUser._id ||
                    msg.sender === currentUser._id;
                  const username = msg.sender?.username || 
                    msg.sender?.name || 
                    "Unknown User";
                  
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
                        {!isSender && (
                          <p className="text-xs font-light mb-1">
                            {username}
                          </p>
                        )}

                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 text-right ${
                          isSender ? 'text-black/50' : 'text-white/50'
                        }`}>
                          {new Date(
                            msg.timestamp || msg.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {isSender && (
                          <div className="flex justify-end mt-2 gap-3">
                            <button
                              onClick={() => {
                                const newText = prompt(
                                  "Edit message:",
                                  msg.message
                                );
                                if (newText && newText !== msg.message) {
                                  handleEditMessage(msg._id, newText);
                                }
                              }}
                              className={`text-xs ${isSender ? 'text-black/50 hover:text-black' : 'text-white/50 hover:text-white'}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Delete this message?")) {
                                  handleDeleteMessage(msg._id);
                                }
                              }}
                              className={`text-xs ${isSender ? 'text-black/50 hover:text-black' : 'text-white/50 hover:text-white'}`}
                            >
                              Delete
                            </button>
                          </div>
                        )}
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
