import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import SideBar from '../../components/SideBar';

export default function Home() {

  const {currentUser} = useSelector(state=> state.user);
  const navigate = useNavigate();
  // console.log(currentUser);
  
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(["Charlie", "David"]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);

  return (
    <div className='flex  h-screen  bg-gray-800'>
      <SideBar/>
      <div className='border border-red-800 flex-1 h-full'>
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