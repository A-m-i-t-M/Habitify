import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

export default function Home() {

  const {currentUser} = useSelector(state=> state.user);
  const navigate = useNavigate();
  const [choice, setChoice] = useState("default");
  console.log(currentUser);
  
  if(!currentUser){
    navigate("/");
  }

  return (
    <div className='flex gap-4 h-screen overflow-hidden'>
      <div className='border border-red-800  w-64 h-full flex flex-col'>
        <p className='px-2 py-4 font-semibold under'>Current Streak: <span className='text-red-800'>69</span></p>

        <div className='flex flex-col items-center justify-center gap-3'>
          <button className='p-2 border border-green-700 rounded-2xl' onClick={()=>{setChoice("Add Friend")}}>Add Friend</button>
          <button className='p-2 border border-green-700 rounded-2xl' onClick={()=>{setChoice("View Friend")}}>View friends</button>
          <button className='p-2 border border-green-700 rounded-2xl' onClick={()=>{setChoice("Add Habit")}}>Add Habit</button>
          <button className='p-2 border border-green-700 rounded-2xl' onClick={()=>{setChoice("View Habit")}}>View Habits</button>
          <button className='p-2 border border-green-700 rounded-2xl' onClick={()=>{setChoice("Add Post")}}>Add Post</button>
          <button className='p-2 border border-green-700 rounded-2xl' onClick={()=>{setChoice("View Post")}}>View Posts</button>
        </div>

      </div>
      <div className='border border-red-800 flex-1 h-full'>
        {/* Second box */}
        {choice === "default" && 
          <div className='mx-auto p-4 h-full'>
            <div className='flex justify-evenly '>
              <div className='h-12'>TODAY'S GOALS</div>
              <div className='h-12'>PROGRESS</div>
            </div>
            <div className='border border-black h-full flex items-center justify-center'>
              <div className=' text-center mx-auto'>I DONT KNOW WHAT IS SUPPOSSED TO COME HERE</div>
            </div>
          </div>}
        {}
        {}
        {}
        {}
        {}
        {}
      </div>




    </div>

  )
}