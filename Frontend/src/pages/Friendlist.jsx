import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../../components/SideBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Friendlist() {
  const {currentUser} = useSelector(state=> state.user);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  
  useEffect(() => {
    const getFriends = async () => {
      setLoading(true);
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
      } catch (error) {
        console.log(error);
        setError("Failed to fetch friends");
      } finally {
        setLoading(false);
      }
    };

    const getPendingRequests = async () => {
      try {
        const res = await fetch("/backend/friend/pending-requests", {
          method : "POST",
          headers : {
            'Content-Type' : "application/json",
          }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message);
          return;
        }
        setPendingRequests(data);
      } catch (error) {
        console.log(error);
        setError("Failed to fetch pending requests");
      }
    };

    getFriends();
    getPendingRequests();
  }, []);
  
  const handleAccept = async (friend) => {
    try {
      const res = await fetch("/backend/friend/accept-request", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senderUsername : friend.username })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setFriends([...friends, friend]);
      setPendingRequests(pendingRequests.filter(req => req._id !== friend._id));
    } catch (error) {
      console.log(error);
      setError("Failed to accept request");
    }
  };

  const handleDecline = async(friend) => {
    try {
      const res = await fetch("/backend/friend/reject",{
        method : "POST",
        headers : {
          'Content-Type' : 'application/json',
        },
        body : JSON.stringify({senderUsername : friend.username}),
      })
      const data = await res.json();
      if(!res.ok){
        setError(data.message);
        return;
      }
      setPendingRequests(pendingRequests.filter(req => req._id !== friend._id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if(!username){
      setError("Username cannot be empty.");
      return;
    }
    try {
      const res = await fetch("/backend/friend/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setUsername("");
      setError(null);
    } catch (error) {
      console.log(error);
      setError("Failed to send request");
    }
  };

  const handleDelete = async(friend)=>{
    try {
      const res = await fetch("/backend/friend/delete-friend",{
        method : "POST",
        headers : {
          'Content-Type' : "application/json",
        },
        body : JSON.stringify({friendUsername : friend.username}),
      });
      const data = await res.json();
      if(!res.ok){
        setError("Could not delete friend.");
        return;
      }
      setFriends(friends.filter(frien => frien._id !== friend._id));
    } catch (error) {
      console.log(error);      
      setError("Could not delete friend.");
    }
  }  

  return (
    <div className='flex min-h-screen bg-black text-white'>
      <SideBar/>
      <div className='flex-1 px-8 py-6'>
        <h1 className="text-2xl font-light tracking-widest uppercase mb-8">Friends</h1>
        
        {/* Add Friend Form */}
        <div className='mb-10'>
          <form 
            className='flex flex-col sm:flex-row items-center gap-4' 
            onSubmit={handleSendRequest}
          >
            <div className="relative flex-1">
              <input 
                type='text' 
                id='username' 
                name='username' 
                placeholder='Enter username' 
                className='w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className='px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light'
            >
              Send Request
            </button>
          </form>
          
          {error && (
            <p className='text-red-400 text-xs mt-2 tracking-wider'>{error}</p>
          )}
        </div>
        
        {/* Friends and Requests */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Friends List */}
          <div>
            <h2 className='text-lg font-light mb-4'>Your Friends</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : friends.length > 0 ? (
              <AnimatePresence>
                <div className='space-y-2'>
                  {friends.map((friend) => (
                    <motion.div 
                      key={friend._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-between items-center p-3 border border-white/10 hover:border-white/30 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3">
                        {friend.avatar && (
                          <img 
                            src={friend.avatar} 
                            alt={friend.username} 
                            className="w-8 h-8 rounded-full object-cover border border-white/20"
                          />
                        )}
                        <span className="font-light">{friend.username}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(friend)}
                        className="text-xs tracking-wider uppercase text-red-500/70 hover:text-white transition-colors duration-300"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <p className="text-white/50 text-sm">No friends added yet.</p>
            )}
          </div>
          
          {/* Pending Requests */}
          <div>
            <h2 className='text-lg font-light mb-4'>Pending Requests</h2>
            
            {pendingRequests.length > 0 ? (
              <AnimatePresence>
                <div className='space-y-2'>
                  {pendingRequests.map((friend) => (
                    <motion.div 
                      key={friend._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-between items-center p-3 border border-white/10 hover:border-white/30 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3">
                        {friend.avatar && (
                          <img 
                            src={friend.avatar} 
                            alt={friend.username} 
                            className="w-8 h-8 rounded-full object-cover border border-white/20"
                          />
                        )}
                        <span className="font-light">{friend.username}</span>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAccept(friend)}
                          className="px-3 py-1 bg-white text-black text-xs tracking-wider uppercase hover:bg-gray-200 transition-colors duration-300"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleDecline(friend)}
                          className="px-3 py-1 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
                        >
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <p className="text-white/50 text-sm">No pending requests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
