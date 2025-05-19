import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function GroupChats() {
  const { currentUser } = useSelector(state => state.user);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [viewMembersModal, setViewMembersModal] = useState(false);

  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("/backend/groups/get", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
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
          Authorization: `Bearer ${currentUser.token}`,
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
          Authorization: `Bearer ${currentUser.token}`,
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
              Authorization: `Bearer ${currentUser.token}`,
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
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const refreshData = await refreshRes.json();
      setGroups(refreshData.groups || []);

      // Close modal and reset form
      setShowModal(false);
      setGroupName('');
      setSelectedFriends([]);
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
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      setGroups(prev => prev.filter(group => group._id !== groupId));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete group");
    }
  };

  // Add member to group
  const handleAddMember = async (friendId) => {
    try {
      const res = await fetch('/backend/groups/addMember', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
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
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const refreshData = await refreshRes.json();
      setGroups(refreshData.groups || []);
      
      setAddMemberModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add member");
    }
  };

  // Remove member from group
  const handleRemoveMember = async (groupId, memberId) => {
    try {
      const res = await fetch('/backend/groups/remove', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
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
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove member");
    }
  };

  // Fetch members of a group
  const fetchGroupMembers = async (groupId) => {
    try {
      setLoading(true);
      const res = await fetch('backend/groups/members', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
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

  // Toggle friend selection in create group modal
  const toggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Group Chats</h1>
        <button
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            setShowModal(true);
            fetchFriends();
          }}
        >
          Create Group
        </button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4">
          {error}
          <button 
            className="ml-2 font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {loading && !showModal && !addMemberModal && !viewMembersModal ? (
        <p className="text-center py-4">Loading...</p>
      ) : (
        <ul className="space-y-2">
          {groups.length === 0 ? (
            <p className="text-center py-4">No groups found.</p>
          ) : (
            groups.map(group => (
              <li key={group._id} className="bg-gray-700 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{group.name}</span>
                  <div className="flex space-x-2">
                    <button
                      className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => fetchGroupMembers(group._id)}
                    >
                      Members
                    </button>
                    
                    {group.admin._id === currentUser._id && (
                      <>
                        <button
                          className="bg-purple-500 px-3 py-1 rounded hover:bg-purple-600"
                          onClick={() => {
                            setCurrentGroupId(group._id);
                            setAddMemberModal(true);
                            fetchFriends();
                          }}
                        >
                          Add Member
                        </button>
                        <button
                          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                          onClick={() => handleDeleteGroup(group._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-300">
                  Admin: {group.admin.username}
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create New Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 mb-4 text-white"
            />

            <h3 className="font-semibold mb-2">Select Friends</h3>
            {loading ? (
              <p className="text-center py-2">Loading friends...</p>
            ) : friends.length === 0 ? (
              <p className="text-center py-2">No friends found.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {friends.map(friend => (
                  <div key={friend._id} className="flex items-center p-2 hover:bg-gray-700">
                    <input
                      type="checkbox"
                      id={`friend-${friend._id}`}
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => toggleFriend(friend._id)}
                      className="mr-2"
                    />
                    <label htmlFor={`friend-${friend._id}`} className="cursor-pointer">
                      {friend.username}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setGroupName('');
                  setSelectedFriends([]);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className={`px-4 py-2 rounded ${!groupName.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Members</h2>
            
            {loading ? (
              <p className="text-center py-2">Loading friends...</p>
            ) : friends.length === 0 ? (
              <p className="text-center py-2">No friends found.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {friends.map(friend => (
                  <div key={friend._id} className="flex items-center justify-between p-2 hover:bg-gray-700">
                    <span>{friend.username}</span>
                    <button
                      onClick={() => handleAddMember(friend._id)}
                      className="bg-green-600 px-3 py-1 text-sm rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setAddMemberModal(false);
                  setCurrentGroupId(null);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {viewMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Group Members</h2>
            
            {loading ? (
              <p className="text-center py-2">Loading members...</p>
            ) : groupMembers.length === 0 ? (
              <p className="text-center py-2">No members found.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {groupMembers.map(member => (
                  <div key={member._id} className="flex items-center justify-between p-2 hover:bg-gray-700">
                    <span>{member.username}</span>
                    {groups.find(g => g._id === currentGroupId)?.admin._id === currentUser._id && 
                     member._id !== currentUser._id && (
                      <button
                        onClick={() => handleRemoveMember(currentGroupId, member._id)}
                        className="bg-red-600 px-3 py-1 text-sm rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setViewMembersModal(false);
                  setCurrentGroupId(null);
                  setGroupMembers([]);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}