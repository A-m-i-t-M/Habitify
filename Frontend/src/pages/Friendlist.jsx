import React, { useEffect, useState } from 'react'
import { use } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../components/SideBar';

export default function Friendlist() {

  const {currentUser} = useSelector(state=> state.user);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [showHabitsOptions, setShowHabitsOptions] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);

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
    } catch (error) {
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
      setError("Could not delete friend.");
    }
  }  

  return (
    <div className='flex  h-screen  bg-gray-800'>
      <SideBar/>
      <div className='border border-red-800 flex-1 h-full'>
        {/* Second box */}
          <div className='p-4 mt-10'>
            <form className='flex items-center gap-4 mb-6' onSubmit={handleSendRequest}>
              <input type='text' id='username' name='username' placeholder='Enter Username' className='p-2 rounded border w-full' onChange={(e)=>{setUsername(e.target.value)}} value={username}/>
              <button className='p-2 bg-green-700 text-white rounded w-56'>Send Request</button>
            </form>
            <div className='flex'>
              <div className='w-1/2 p-4 border-r'>
                <h2 className='text-xl text-white font-bold mb-4'>Your Friends</h2>
                <ul className='text-white'>
                  {/* {friends.map(friend => (
                    <li key={friend._id} className='p-2 border-b'>{friend.username}</li>
                  ))} */}
                  {friends.length > 0 ? (
                  friends.map((friend) => (
                    <li key={friend._id} className="p-2 border-b flex justify-between">
                      {friend.username}
                      <div>
                        <button className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() => handleDelete(friend)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))
                  ) : (
                    <p className="text-gray-400">No friends added yet.</p>
                  )}
                </ul>
              </div>
              <div className='w-1/2 p-4'>
                <h2 className='text-xl text-white font-bold mb-4'>Pending Requests</h2>
                <ul className='text-white'>
                  {/* {pendingRequests.map(friend => (
                    <li key={friend} className='p-2 border-b flex justify-between'>
                      {friend}
                      <div>
                        <button className='bg-green-500 text-white px-2 py-1 rounded mr-2' onClick={() => handleAccept(friend)}>Accept</button>
                        <button className='bg-red-500 text-white px-2 py-1 rounded' onClick={() => handleDecline(friend)}>Decline</button>
                      </div>
                    </li>
                  ))} */}
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((friend) => (
                      <li key={friend._id} className="p-2 border-b flex justify-between">
                        {friend.username}
                        <div>
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                            onClick={() => handleAccept(friend)}
                          >
                            Accept
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() => handleDecline(friend)}
                          >
                            Decline
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-400">No pending requests.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
      </div>
    </div>

  )
}
