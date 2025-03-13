import React, { useEffect, useState } from 'react'
import { use } from 'react';
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

export default function Home() {

  const {currentUser} = useSelector(state=> state.user);
  if(!currentUser){
    navigate("/");
  }
  const navigate = useNavigate();
  console.log(currentUser);
  
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(["Charlie", "David"]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  

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
          <div className='mx-auto p-4 h-full'>
            <div className='flex justify-evenly '>
              <div className='h-12'>TODAY'S GOALS</div>
              <div className='h-12'>PROGRESS</div>
            </div>
            <div className='border border-black max-h-screen flex items-center justify-center'>
              <div className=' text-center mx-auto'>I DONT KNOW WHAT IS SUPPOSSED TO COME HERE</div>
            </div>
          </div>



    </div>
    </div>

  )
}