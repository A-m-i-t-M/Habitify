// src/components/GroupList.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function GroupList() {
  const { currentUser } = useSelector(state => state.user);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div className="text-center py-4">Loading your groups...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Your Groups</h2>
      
      {groups.length === 0 ? (
        <p className="text-center py-4">You have not joined any groups yet.</p>
      ) : (
        <ul className="space-y-2">
          {groups.map(group => (
            <li key={group._id} className="bg-gray-800 p-3 rounded-md hover:bg-gray-700">
              <Link to={`/group-chat/${group._id}`} className="block">
                <div className="font-medium">{group.name}</div>
                <div className="mt-1 text-sm text-gray-400">
                  {group.members.length} members • Admin: {group.admin.username}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
