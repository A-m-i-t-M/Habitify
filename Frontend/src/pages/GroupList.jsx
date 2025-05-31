// src/components/GroupList.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SideBar from '../components/SideBar';
import { API_CALL_PREFIX } from '../../config.js';
// tobtobitbo
export default function GroupList() {
  const { currentUser } = useSelector(state => state.user);
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
  const token = localStorage.getItem("token");
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
        const res = await fetch(`${API_CALL_PREFIX}/backend/groups/get`, {
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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
  }, [currentUser, token]);

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_CALL_PREFIX}/backend/friend/get-friends`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json','Authorization': `Bearer ${token}`
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
      const createRes = await fetch(`${API_CALL_PREFIX}/backend/groups/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json','Authorization': `Bearer ${token}`
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
          await fetch(`${API_CALL_PREFIX}/backend/groups/addMember`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json','Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              groupId: newGroup._id,
              userId: friendId,
            }),
          });
        }
      }

      // Refresh the group list
      const refreshRes = await fetch(`${API_CALL_PREFIX}/backend/groups/get`, {
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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
      const res = await fetch(`${API_CALL_PREFIX}/backend/groups/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json','Authorization': `Bearer ${token}`
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
      const res = await fetch(`${API_CALL_PREFIX}/backend/groups/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
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
      const res = await fetch(`${API_CALL_PREFIX}/backend/groups/addMember`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json','Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          groupId: currentGroupId,
          userId: friendId,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      
      // Refresh groups after adding member
      const refreshRes = await fetch(`${API_CALL_PREFIX}/backend/groups/get`, {
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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
      const res = await fetch(`${API_CALL_PREFIX}/backend/groups/members`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json','Authorization': `Bearer ${token}`
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
      const res = await fetch(`${API_CALL_PREFIX}/backend/groups/remove`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json','Authorization': `Bearer ${token}`
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
    <div className="flex min-h-screen bg-base text-text-primary font-sans">
      <SideBar />
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif text-text-primary">Your Groups</h1>
            <button
              className="px-6 py-3 bg-primary text-bg hover:bg-accent-hover rounded-md shadow-md transition-all duration-300 ease-in-out text-sm font-medium tracking-wide"
              onClick={() => {
                setShowModal(true);
                fetchFriends();
              }}
            >
              Create Group
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 border border-red-500 bg-error-bg text-error-text rounded-md shadow-sm flex justify-between items-center">
              <span>{error}</span>
              <button 
                className="text-error-text hover:text-red-400 transition-colors duration-200"
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 border border-green-500 bg-success-bg text-success-text rounded-md shadow-sm flex justify-between items-center">
              <span>{successMessage}</span>
              <button 
                className="text-success-text hover:text-green-400 transition-colors duration-200"
                onClick={() => setSuccessMessage(null)}
              >
                ×
              </button>
            </div>
          )}
          
          {loading && !showModal && !addMemberModal && !viewMembersModal && !editGroupModal ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error && !showModal ? (
            <p className="text-error-text text-center py-4">{error}</p>
          ) : groups.length === 0 && !showModal ? (
            <div className="text-center py-10">
              <p className="text-text-secondary mb-6 text-lg">You haven&apos;t joined any groups yet.</p>
              <button 
                onClick={() => {
                  setShowModal(true);
                  fetchFriends();
                }}
                className="px-8 py-3 bg-primary text-bg hover:bg-accent-hover rounded-md shadow-md transition-all duration-300 ease-in-out text-base font-medium tracking-wide"
              >
                Create a Group
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {groups.map((group, index) => (
                  <motion.div 
                    key={group._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-bg-secondary border border-border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center">
                        <Link 
                          to={`/group-chat/${group._id}`}
                          className="flex items-center group"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mr-4 text-bg text-xl font-serif">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-serif text-xl text-text-primary group-hover:text-accent transition-colors duration-200">{group.name}</h3>
                            <p className="text-sm text-text-secondary mt-1">
                              {group.members.length} members • Admin: {group.admin.username}
                            </p>
                          </div>
                        </Link>
                        
                        <div className="flex gap-3">
                          <button
                            className="px-4 py-2 bg-transparent border border-primary text-primary hover:bg-primary hover:text-bg rounded-md transition-all duration-300 ease-in-out text-xs font-medium tracking-wide"
                            onClick={() => fetchGroupMembers(group._id)}
                          >
                            Members
                          </button>
                          
                          {group.admin._id === currentUser._id && (
                            <>
                              <button
                                className="px-4 py-2 bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-bg rounded-md transition-all duration-300 ease-in-out text-xs font-medium tracking-wide"
                                onClick={() => {
                                  setCurrentGroupId(group._id);
                                  setEditGroupName(group.name);
                                  setEditGroupModal(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="px-4 py-2 bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-bg rounded-md transition-all duration-300 ease-in-out text-xs font-medium tracking-wide"
                                onClick={() => {
                                  setCurrentGroupId(group._id);
                                  setAddMemberModal(true);
                                  fetchFriends();
                                }}
                              >
                                Add
                              </button>
                              <button
                                className="px-4 py-2 bg-transparent border border-error text-error hover:bg-error hover:text-bg rounded-md transition-all duration-300 ease-in-out text-xs font-medium tracking-wide"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: "circOut" }}
            className="bg-bg-secondary p-8 border border-border rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-serif text-text-primary mb-6 text-center">Create New Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full p-3 bg-bg border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-md transition-all duration-300 ease-in-out text-sm mb-6 shadow-sm"
            />

            <h3 className="text-text-secondary text-base mb-3">Select Friends</h3>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : friends.length === 0 ? (
              <p className="text-text-secondary text-center py-8 text-sm">No friends found.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 mb-6 p-1 custom-scrollbar">
                {friends.map(friend => (
                  <div key={friend._id} className="flex items-center p-3 hover:bg-bg-hover rounded-md transition-colors duration-200 cursor-pointer" onClick={() => toggleFriend(friend._id)}>
                    <input
                      type="checkbox"
                      id={`friend-${friend._id}`}
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => {}} // onChange is handled by div click
                      className="form-checkbox h-5 w-5 text-primary bg-bg border-border rounded focus:ring-primary mr-3 cursor-pointer"
                    />
                    <label htmlFor={`friend-${friend._id}`} className="cursor-pointer flex items-center flex-grow">
                      {friend.avatar ? (
                        <img 
                          src={friend.avatar} 
                          alt={friend.username} 
                          className="w-8 h-8 rounded-full mr-3 object-cover border border-border shadow-sm" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3 text-bg text-sm font-serif shadow-sm">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-text-primary">{friend.username}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  setGroupName('');
                  setSelectedFriends([]);
                  setError(null);
                }}
                className="px-6 py-3 border border-border text-text-secondary hover:border-primary hover:text-primary rounded-md transition-all duration-300 ease-in-out text-sm font-medium tracking-wide"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className="px-6 py-3 bg-primary text-bg hover:bg-accent-hover rounded-md shadow-sm transition-all duration-300 ease-in-out text-sm font-medium tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editGroupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: "circOut" }}
            className="bg-bg-secondary p-8 border border-border rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-serif text-text-primary mb-6 text-center">Edit Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={editGroupName}
              onChange={e => setEditGroupName(e.target.value)}
              className="w-full p-3 bg-bg border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-md transition-all duration-300 ease-in-out text-sm mb-6 shadow-sm"
            />

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setEditGroupModal(false);
                  setEditGroupName('');
                  setCurrentGroupId(null);
                  setError(null);
                }}
                className="px-6 py-3 border border-border text-text-secondary hover:border-primary hover:text-primary rounded-md transition-all duration-300 ease-in-out text-sm font-medium tracking-wide"
              >
                Cancel
              </button>
              <button
                onClick={handleEditGroup}
                disabled={!editGroupName.trim()}
                className="px-6 py-3 bg-primary text-bg hover:bg-accent-hover rounded-md shadow-sm transition-all duration-300 ease-in-out text-sm font-medium tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: "circOut" }}
            className="bg-bg-secondary p-8 border border-border rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-serif text-text-primary mb-6 text-center">Add Members</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : friends.length === 0 ? (
              <p className="text-text-secondary text-center py-8 text-sm">No friends available to add.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 mb-6 p-1 custom-scrollbar">
                {friends.map(friend => (
                  <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-bg-hover rounded-md transition-colors duration-200">
                    <div className="flex items-center">
                      {friend.avatar ? (
                        <img 
                          src={friend.avatar} 
                          alt={friend.username} 
                          className="w-8 h-8 rounded-full mr-3 object-cover border border-border shadow-sm" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3 text-bg text-sm font-serif shadow-sm">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-text-primary">{friend.username}</span>
                    </div>
                    <button
                      onClick={() => handleAddMember(friend._id)}
                      className="px-4 py-2 bg-primary text-bg hover:bg-accent-hover rounded-md shadow-sm transition-all duration-300 ease-in-out text-xs font-medium tracking-wide"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={() => {
                  setAddMemberModal(false);
                  setCurrentGroupId(null);
                  setError(null);
                }}
                className="px-6 py-3 border border-border text-text-secondary hover:border-primary hover:text-primary rounded-md transition-all duration-300 ease-in-out text-sm font-medium tracking-wide"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Members Modal */}
      {viewMembersModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: "circOut" }}
            className="bg-bg-secondary p-8 border border-border rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-serif text-text-primary mb-6 text-center">Group Members</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : groupMembers.length === 0 ? (
              <p className="text-text-secondary text-center py-8 text-sm">This group has no members yet.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 mb-6 p-1 custom-scrollbar">
                {groupMembers.map(member => (
                  <div key={member._id} className="flex items-center justify-between p-3 hover:bg-bg-hover rounded-md transition-colors duration-200">
                    <div className="flex items-center">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.username} 
                          className="w-8 h-8 rounded-full mr-3 object-cover border border-border shadow-sm" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3 text-bg text-sm font-serif shadow-sm">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-text-primary">{member.username}</span>
                    </div>
                    {groups.find(g => g._id === currentGroupId)?.admin._id === currentUser._id && 
                     member._id !== currentUser._id && (
                      <button
                        onClick={() => handleRemoveMember(currentGroupId, member._id)}
                        className="px-4 py-2 bg-transparent border border-error text-error hover:bg-error hover:text-bg rounded-md transition-all duration-300 ease-in-out text-xs font-medium tracking-wide"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={() => {
                  setViewMembersModal(false);
                  setCurrentGroupId(null);
                  setGroupMembers([]);
                  setError(null);
                }}
                className="px-6 py-3 border border-border text-text-secondary hover:border-primary hover:text-primary rounded-md transition-all duration-300 ease-in-out text-sm font-medium tracking-wide"
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