import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {FaHome, FaChartBar} from 'react-icons/fa';
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

  return (
    <div className='border border-red-800  w-64 min-h-screen flex flex-col'>
        <div className='flex justify-center items-center gap-6'>
          <p className='px-2 py-4 font-semibold under mt-6 ml-2'>Current Streak: 
            <span className='text-red-800'> {streak?.streak || 0}</span>
          </p>
          <div className='relative inline-block group'>
            <button onClick={()=>navigate("/leaderboard")} className='px-2 py-4 mt-6 cursor-pointer'><FaChartBar size={24} color='green'/></button>
            <div className='absolute bottom-[-12px] left-1/2 -translate-x-1/2 bg-gray-700 text-white text-center text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-10'>
              {/* Daily<br/>Leaderboard */}
              Leaderboard
            </div>
          </div>
        </div>
        <div className='flex flex-col items-center justify-center gap-8 mt-10'>
          <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/friends", {state : {currentUser}}) }>Friendlist</button>
          <div className='w-40'>
            <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={()=>navigate("/friendforchat")}>
              Chat
            </button>
          </div>
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
