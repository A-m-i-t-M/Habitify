import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { API_CALL_PREFIX } from '../../config.js';
export default function FriendsList() {
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
        try {
            const res = await fetch(`${API_CALL_PREFIX}/backend/friend/get-friends`,{
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

  if (loading) return <div className="text-center p-6 text-text-muted font-serif">Loading friends...</div>;
  if (error) return <div className="text-center p-6 text-red-500 font-serif">Failed to load friends. Please try again later.</div>;

  return (
    <div className="min-h-screen bg-bg text-text-primary p-4 md:p-8 font-serif flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-primary mb-8 text-center">Your Friends</h1>
        {friends.length === 0 ? (
          <p className="text-text-muted text-center py-6">You haven&apos;t added any friends yet.</p>
        ) : (
          <ul className="space-y-3">
            {friends.map(friend => (
              <li key={friend._id} className="bg-bg border border-secondary p-4 rounded-lg hover:shadow-md cursor-pointer transition-shadow flex justify-between items-center shadow-sm"
                  onClick={() => navigate(`/chat/${friend._id}`)}>
                <div className="flex items-center gap-3">
                    <img src={friend.avatar} alt={`${friend.username}'s avatar`} className="w-10 h-10 rounded-full object-cover border border-secondary/50"/>
                    <div>
                        <span className="font-medium text-text-primary block">{friend.username}</span>
                        <span className="text-sm text-text-muted block">{friend.email}</span>
                    </div>
                </div>
                <span className="text-xs text-secondary hover:text-accent transition-colors">Chat</span>
              </li>
            ))}
          </ul>
        )}
        <button className="mt-8 bg-primary text-bg px-6 py-2.5 rounded-lg hover:bg-accent transition shadow-md block mx-auto"
                onClick={() => navigate('/home')}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
