import  { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

export default function FriendsList() {
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
        try {
            const res = await fetch("/backend/friend/get-friends",{
              method : "POST",
              headers : {
                'Content-Type' : 'application/json',
              }
            });
            const data = await res.json();
            if (!res.ok) {
              setError(data.message);
              setLoading(false);
              return;
            }
            setFriends(data);
          } catch (err) {
            console.log(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currentUser]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Failed to load friends</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">Friends List</h1>
      <ul className="space-y-2">
        {friends.length === 0 ? (
          <p>No friends found.</p>
        ) : (
          friends.map(friend => (
            <li key={friend._id} className="bg-gray-700 p-3 rounded-md hover:bg-gray-600 cursor-pointer"
                onClick={() => navigate(`/chat/${friend._id}`)}>
              {friend.username} ({friend.email})
            </li>
          ))
        )}
      </ul>
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => navigate('/home')}>
        Back to Home
      </button>
    </div>
  );
}
