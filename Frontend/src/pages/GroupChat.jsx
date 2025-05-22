// src/components/GroupChat.jsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center border-b border-gray-700 pb-3 mb-4">
        <h1 className="text-xl font-bold">
          {groupInfo ? groupInfo.groupName : "Loading..."}
        </h1>
        <span className="ml-2 text-sm text-gray-400">
          {groupInfo ? `${groupInfo.members.length} members` : ""}
        </span>
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
              const isSender =
                msg.sender._id === currentUser._id ||
                msg.sender === currentUser._id;
              return (
                <div
                  key={msgIndex}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                      isSender
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-700 text-white rounded-bl-none"
                    }`}
                  >
                    {!isSender && (
                      <p className="text-xs font-semibold mb-1">
                        {msg.sender.username ||
                          msg.sender.name ||
                          "Unknown User"}
                      </p>
                    )}

                    <p className="text-sm break-words">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 text-right ${
                        isSender ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {new Date(
                        msg.timestamp || msg.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {isSender && (
                      <div className="flex justify-end mt-1 space-x-2">
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
                          className="text-xs text-blue-200 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this message?")) {
                              handleDeleteMessage(msg._id);
                            }
                          }}
                          className="text-xs text-blue-200 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    )}
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
