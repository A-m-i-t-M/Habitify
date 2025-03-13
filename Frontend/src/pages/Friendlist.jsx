import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Friendlist() {

  const {currentUser} = useSelector(state=> state.user);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const getFriends = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/backend/friend/get-friends");
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
        const res = await fetch("http://localhost:3000/backend/friend/pending-requests");
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

  console.log(friends);
  
  const handleAccept = async (friend) => {
    try {
      const res = await fetch("http://localhost:3000/backend/friend/accept-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: friend })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setFriends([...friends, friend]);
      setPendingRequests(pendingRequests.filter(req => req !== friend));
    } catch (error) {
      setError("Failed to accept request");
    }
  };

  const handleDecline = (friend) => {
    setPendingRequests(pendingRequests.filter(req => req !== friend));
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/backend/friend/send-request", {
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

  return (
    <div className='flex  h-screen  bg-gray-800'>
      <div className='border border-red-800  w-64 h-full flex flex-col'>
        <p className='px-2 py-4 font-semibold under mt-6 ml-3'>Current Streak: <span className='text-red-800'>69</span></p>

        <div className='flex flex-col items-center justify-center gap-8 mt-10'>
        <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/friends", {state : {currentUser}}) }>Friendlist</button>
          <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/habits") }>Habits</button>
          <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/posts") }>Posts</button>
        </div>

      </div>
      <div className='border border-red-800 flex-1 h-full'>
        {/* Second box */}
        
          
          
          <div className='p-4 mt-10'>
            <form className='flex items-center gap-4 mb-6'>
              <input type='text' id='username' name='username' placeholder='Enter Username' className='p-2 rounded border w-full' />
              <button className='p-2 bg-green-700 text-white rounded w-56'>Send Request</button>
            </form>
            <div className='flex'>
              <div className='w-1/2 p-4 border-r'>
                <h2 className='text-xl text-white font-bold mb-4'>Your Friends</h2>
                <ul className='text-white'>
                  {friends.map(friend => (
                    <li key={friend} className='p-2 border-b'>{friend}</li>
                  ))}
                </ul>
              </div>
              <div className='w-1/2 p-4'>
                <h2 className='text-xl text-white font-bold mb-4'>Pending Requests</h2>
                <ul className='text-white'>
                  {pendingRequests.map(friend => (
                    <li key={friend} className='p-2 border-b flex justify-between'>
                      {friend}
                      <div>
                        <button className='bg-green-500 text-white px-2 py-1 rounded mr-2' onClick={() => handleAccept(friend)}>Accept</button>
                        <button className='bg-red-500 text-white px-2 py-1 rounded' onClick={() => handleDecline(friend)}>Decline</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
      </div>
    </div>

  )
}
