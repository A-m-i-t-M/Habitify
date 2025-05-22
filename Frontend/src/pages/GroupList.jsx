// src/components/GroupList.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SideBar from '../../components/SideBar';

export default function GroupList() {
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [viewMembersModal, setViewMembersModal] = useState(false);
  const [editGroupModal, setEditGroupModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');

  // Display success message for 3 seconds then hide it
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("/backend/groups/get", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch groups");

        setGroups(data.groups || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser]);

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await fetch("/backend/friend/get-friends", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load friends");
      }
      setFriends(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  // Create a new group
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    try {
      // First create the group with just the admin
      const createRes = await fetch('/backend/groups/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
        }),
      });

      const groupData = await createRes.json();
      if (!createRes.ok) throw new Error(groupData.message || groupData.error);

      const newGroup = groupData.group;
      
      // Then add each selected friend to the group
      if (selectedFriends.length > 0) {
        for (const friendId of selectedFriends) {
          await fetch('/backend/groups/addMember', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              groupId: newGroup._id,
              userId: friendId,
            }),
          });
        }
      }

      // Refresh the group list
      const refreshRes = await fetch("/backend/groups/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const refreshData = await refreshRes.json();
      setGroups(refreshData.groups || []);

      // Close modal and reset form
      setShowModal(false);
      setGroupName('');
      setSelectedFriends([]);
      setSuccessMessage("Group created successfully");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create group");
    }
  };

  // Delete a group
  const handleDeleteGroup = async (groupId) => {
    try {
      const res = await fetch(`/backend/groups/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      setGroups(prev => prev.filter(group => group._id !== groupId));
      setSuccessMessage("Group deleted successfully");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete group");
    }
  };

  // Edit a group
  const handleEditGroup = async () => {
    if (!editGroupName.trim()) {
      setError("Group name is required");
      return;
    }

    try {
      const res = await fetch('/backend/groups/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
          groupId: currentGroupId,
          name: editGroupName,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      
      // Update the group name in the local state
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group._id === currentGroupId 
            ? { ...group, name: editGroupName } 
            : group
        )
      );
      
      // Close modal and reset form
      setEditGroupModal(false);
      setEditGroupName('');
      setCurrentGroupId(null);
      setSuccessMessage("Group updated successfully");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update group");
    }
  };

  // Add member to group
  const handleAddMember = async (friendId) => {
    try {
      const res = await fetch('/backend/groups/addMember', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: currentGroupId,
          userId: friendId,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      
      // Refresh groups after adding member
      const refreshRes = await fetch("/backend/groups/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const refreshData = await refreshRes.json();
      setGroups(refreshData.groups || []);
      
      setAddMemberModal(false);
      setSuccessMessage("Member added successfully");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add member");
    }
  };

  // Fetch members of a group
  const fetchGroupMembers = async (groupId) => {
    try {
      setLoading(true);
      const res = await fetch('/backend/groups/members', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      
      setGroupMembers(data.members || []);
      setCurrentGroupId(groupId);
      setViewMembersModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch group members");
    } finally {
      setLoading(false);
    }
  };

  // Remove member from group
  const handleRemoveMember = async (groupId, memberId) => {
    try {
      const res = await fetch('/backend/groups/remove', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          memberId,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      
      // Refresh the members list
      fetchGroupMembers(groupId);
      setSuccessMessage("Member removed successfully");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove member");
    }
  };

  // Toggle friend selection in create group modal
  const toggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <SideBar />
      <div className="flex-1 px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-light tracking-widest uppercase">Your Groups</h1>
            <button
              className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light"
              onClick={() => {
                setShowModal(true);
                fetchFriends();
              }}
            >
              Create Group
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 border border-red-400 bg-black text-red-400 text-sm flex justify-between items-center">
              <span>{error}</span>
              <button 
                className="text-red-400 hover:text-red-300"
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 border border-green-400 bg-black text-green-400 text-sm flex justify-between items-center">
              <span>{successMessage}</span>
              <button 
                className="text-green-400 hover:text-green-300"
                onClick={() => setSuccessMessage(null)}
              >
                ×
              </button>
            </div>
          )}
          
          {loading && !showModal && !addMemberModal && !viewMembersModal && !editGroupModal ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : error && !showModal ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : groups.length === 0 && !showModal ? (
            <div className="text-center">
              <p className="text-white/50 mb-6">You haven&apos;t joined any groups yet.</p>
              <button 
                onClick={() => {
                  setShowModal(true);
                  fetchFriends();
                }}
                className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light"
              >
                Create a Group
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {groups.map((group, index) => (
                  <motion.div 
                    key={group._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border border-white/10 hover:border-white/30 transition-colors duration-300"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <Link 
                          to={`/group-chat/${group._id}`}
                          className="flex items-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4 text-sm font-light">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-light">{group.name}</h3>
                            <p className="text-xs text-white/50 mt-1">
                              {group.members.length} members • Admin: {group.admin.username}
                            </p>
                          </div>
                        </Link>
                        
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
                            onClick={() => fetchGroupMembers(group._id)}
                          >
                            Members
                          </button>
                          
                          {group.admin._id === currentUser._id && (
                            <>
                              <button
                                className="px-3 py-1 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
                                onClick={() => {
                                  setCurrentGroupId(group._id);
                                  setEditGroupName(group.name);
                                  setEditGroupModal(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="px-3 py-1 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
                                onClick={() => {
                                  setCurrentGroupId(group._id);
                                  setAddMemberModal(true);
                                  fetchFriends();
                                }}
                              >
                                Add
                              </button>
                              <button
                                className="px-3 py-1 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
                                onClick={() => handleDeleteGroup(group._id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black p-6 border border-white/10 w-full max-w-md"
          >
            <h2 className="text-xl font-light tracking-wider mb-6">Create New Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm mb-6"
            />

            <h3 className="text-white/70 text-sm mb-3">Select Friends</h3>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : friends.length === 0 ? (
              <p className="text-white/50 text-center py-8">No friends found.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
                {friends.map(friend => (
                  <div key={friend._id} className="flex items-center p-3 hover:bg-white/5 transition-colors duration-200">
                    <input
                      type="checkbox"
                      id={`friend-${friend._id}`}
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => toggleFriend(friend._id)}
                      className="mr-3"
                    />
                    <label htmlFor={`friend-${friend._id}`} className="cursor-pointer flex items-center">
                      {friend.avatar ? (
                        <img 
                          src={friend.avatar} 
                          alt={friend.username} 
                          className="w-6 h-6 rounded-full mr-2 object-cover border border-white/20" 
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-2 text-xs">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm">{friend.username}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setGroupName('');
                  setSelectedFriends([]);
                  setError(null);
                }}
                className="px-6 py-3 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editGroupModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black p-6 border border-white/10 w-full max-w-md"
          >
            <h2 className="text-xl font-light tracking-wider mb-6">Edit Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={editGroupName}
              onChange={e => setEditGroupName(e.target.value)}
              className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm mb-6"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditGroupModal(false);
                  setEditGroupName('');
                  setCurrentGroupId(null);
                  setError(null);
                }}
                className="px-6 py-3 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditGroup}
                disabled={!editGroupName.trim()}
                className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black p-6 border border-white/10 w-full max-w-md"
          >
            <h2 className="text-xl font-light tracking-wider mb-6">Add Members</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : friends.length === 0 ? (
              <p className="text-white/50 text-center py-8">No friends found.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 mb-6">
                {friends.map(friend => (
                  <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors duration-200">
                    <div className="flex items-center">
                      {friend.avatar ? (
                        <img 
                          src={friend.avatar} 
                          alt={friend.username} 
                          className="w-8 h-8 rounded-full mr-3 object-cover border border-white/20" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 text-sm">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{friend.username}</span>
                    </div>
                    <button
                      onClick={() => handleAddMember(friend._id)}
                      className="px-4 py-1 bg-white text-black text-xs tracking-wider uppercase hover:bg-gray-200 transition-colors duration-300"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setAddMemberModal(false);
                  setCurrentGroupId(null);
                  setError(null);
                }}
                className="px-6 py-3 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Members Modal */}
      {viewMembersModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black p-6 border border-white/10 w-full max-w-md"
          >
            <h2 className="text-xl font-light tracking-wider mb-6">Group Members</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : groupMembers.length === 0 ? (
              <p className="text-white/50 text-center py-8">No members found.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 mb-6">
                {groupMembers.map(member => (
                  <div key={member._id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors duration-200">
                    <div className="flex items-center">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.username} 
                          className="w-8 h-8 rounded-full mr-3 object-cover border border-white/20" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 text-sm">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{member.username}</span>
                    </div>
                    {groups.find(g => g._id === currentGroupId)?.admin._id === currentUser._id && 
                     member._id !== currentUser._id && (
                      <button
                        onClick={() => handleRemoveMember(currentGroupId, member._id)}
                        className="px-4 py-1 border border-white/30 text-xs tracking-wider uppercase text-white hover:border-white transition-colors duration-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setViewMembersModal(false);
                  setCurrentGroupId(null);
                  setGroupMembers([]);
                  setError(null);
                }}
                className="px-6 py-3 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
