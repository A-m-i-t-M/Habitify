import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../../components/SideBar';

export default function Friendlist() {

  const {currentUser} = useSelector(state=> state.user);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  console.log(loading, error);
  
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

  console.log(currentUser);
  
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
      console.log(data);
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
      console.log(data);      
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
    <div className='flex h-screen bg-bg text-text-primary font-serif'>
      <SideBar/>
      <div className='flex-1 h-full overflow-y-auto'>
        {/* Second box */}
          <div className='p-6 mt-8 max-w-4xl mx-auto'>
            <form className='flex items-center gap-4 mb-8 pb-4 border-b border-secondary' onSubmit={handleSendRequest}>
              <input type='text' id='username' name='username' placeholder='Enter Username to Add Friend' className='flex-1 p-3 rounded-lg bg-bg border border-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' onChange={(e)=>{setUsername(e.target.value)}} value={username}/>
              <button className='p-3 bg-primary text-bg rounded-lg hover:bg-accent transition shadow-md px-6'>Send Request</button>
            </form>
            {error && <p className='text-red-500 mb-4 text-center text-sm'>{error}</p>}
            <div className='grid md:grid-cols-2 gap-8'>
              <div className='bg-bg border border-secondary p-6 rounded-xl shadow-md'>
                <h2 className='text-2xl text-primary font-semibold mb-6 pb-2 border-b border-secondary'>Your Friends</h2>
                <ul className='space-y-3'>
                  {friends.length > 0 ? (
                  friends.map((friend) => (
                    <li key={friend._id} className="p-3 border border-secondary rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                      <span className='text-text-primary'>{friend.username}</span>
                      <div>
                        <button className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition text-sm shadow-sm"
                            onClick={() => handleDelete(friend)}>
                          Remove
                        </button>
                      </div>
                    </li>
                  ))
                  ) : (
                    <p className="text-text-muted text-center py-4">No friends added yet.</p>
                  )}
                </ul>
              </div>
              <div className='bg-bg border border-secondary p-6 rounded-xl shadow-md'>
                <h2 className='text-2xl text-primary font-semibold mb-6 pb-2 border-b border-secondary'>Pending Requests</h2>
                <ul className='space-y-3'>
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((friend) => (
                      <li key={friend._id} className="p-3 border border-secondary rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                        <span className='text-text-primary'>{friend.username}</span>
                        <div className='flex gap-2'>
                          <button
                            className="bg-secondary text-bg px-3 py-1.5 rounded-md hover:bg-accent transition text-sm shadow-sm"
                            onClick={() => handleAccept(friend)}
                          >
                            Accept
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition text-sm shadow-sm"
                            onClick={() => handleDecline(friend)}
                          >
                            Decline
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-text-muted text-center py-4">No pending requests.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
      </div>
    </div>

  )
}
