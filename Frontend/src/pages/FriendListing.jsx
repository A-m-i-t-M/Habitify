import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SideBar from '../../components/SideBar';

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
        <div className="text-red-400">Failed to load friends</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <SideBar />
      <div className="flex-1 px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-light tracking-widest uppercase mb-8">Your Chat Connections</h1>
          
          {friends.length === 0 ? (
            <p className="text-white/50 text-center">You haven&apos;t added any friends yet.</p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend, index) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div 
                    onClick={() => navigate(`/chat/${friend._id}`)}
                    className="flex items-center border border-white/10 hover:border-white/30 p-4 transition-colors duration-300 cursor-pointer"
                  >
                    {friend.avatar ? (
                      <img 
                        src={friend.avatar} 
                        alt={friend.username} 
                        className="w-10 h-10 rounded-full object-cover border border-white/20 mr-4" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4 text-sm font-light">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-light">{friend.username}</p>
                      <p className="text-white/50 text-xs">{friend.email}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
