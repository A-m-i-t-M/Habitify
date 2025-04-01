import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function SideBar() {
  
  const {currentUser} = useSelector(state=> state.user);
  const navigate = useNavigate();
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(null);

  useEffect(()=>{
    const getMyStreak = async()=>{
      try {
        const res = await fetch("/backend/goals/streak");
        const data = await res.json();
        if(!res.ok){
          setError(data.message);
          setLoading(false);
          return;
        }
        setStreak(data);
        setError(null);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    getMyStreak();
  },[]);

  console.log(streak);
  
  
  return (
    <div className='border border-red-800  w-64 min-h-screen flex flex-col'>
        <p className='px-2 py-4 font-semibold under mt-6 ml-3'>Current Streak: 
        <span className='text-red-800'>
        {loading ? "Loading..." : error ? "Error" : streak?.streak || 0}
        </span></p>
        <div className='flex flex-col items-center justify-center gap-8 mt-10'>
          <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/friends", {state : {currentUser}}) }>Friendlist</button>
          <div className='w-40'>
            <button 
              className='p-3 w-full border border-green-700 rounded-2xl text-center' 
              onClick={()=>navigate("/habits")}>
              Habits
            </button>
          </div>
          <div className='w-40'>
            <button onClick={()=>setShowPostOptions(!showPostOptions)} className='p-3 w-40 border border-green-700 rounded-2xl text-center'>Posts</button>
            {showPostOptions && 
              <div className='flex flex-col mt-2 gap-2'>
                <button onClick={()=> navigate("/new-post")} className='p-2 border bg-gray-700 rounded-lg text-white'>Create Post</button>
                <button onClick={()=> navigate("/fyp")} className='p-2 border bg-gray-700 rounded-lg text-white'>FYP</button>
              </div>}
          </div>
        </div>

      </div>
  )
}
