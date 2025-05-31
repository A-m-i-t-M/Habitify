import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {FaChartBar} from 'react-icons/fa';
export default function SideBar() {
  
  const {currentUser} = useSelector(state=> state.user);
  const navigate = useNavigate();
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(null);
  console.log(loading, error);
  
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

  // return (
  //   <div className='border border-red-800  w-64 min-h-screen flex flex-col'>
  //       <div className='flex justify-center items-center gap-6'>
  //         <p className='px-2 py-4 font-semibold under mt-6 ml-2'>Current Streak: 
  //           <span className='text-red-800'> {streak?.streak || 0}</span>
  //         </p>
  //         <div className='relative inline-block group'>
  //           <button onClick={()=>navigate("/leaderboard")} className='px-2 py-4 mt-6 cursor-pointer'><FaChartBar size={24} color='green'/></button>
  //           <div className='absolute bottom-[-12px] left-1/2 -translate-x-1/2 bg-gray-700 text-white text-center text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-10'>
  //             {/* Daily<br/>Leaderboard */}
  //             Leaderboard
  //           </div>
  //         </div>
  //       </div>
  //       <div className='flex flex-col items-center justify-center gap-8 mt-10'>
  //         <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/friends", {state : {currentUser}}) }>Friendlist</button>
  //         <div className='w-40'>
  //           <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={()=>navigate("/friendforchat")}>
  //             Chat
  //           </button>
  //         </div>
  //         <div className='w-40'>
  //           <button 
  //             className='p-3 w-full border border-green-700 rounded-2xl text-center' 
  //             onClick={()=>navigate("/habits")}>
  //             Habits
  //           </button>
  //         </div>
  //         <div className='w-40'>
  //           <button onClick={()=>setShowPostOptions(!showPostOptions)} className='p-3 w-40 border border-green-700 rounded-2xl text-center'>Posts</button>
  //           {showPostOptions && 
  //             <div className='flex flex-col mt-2 gap-2'>
  //               <button onClick={()=> navigate("/new-post")} className='p-2 border bg-gray-700 rounded-lg text-white'>Create Post</button>
  //               <button onClick={()=> navigate("/fyp")} className='p-2 border bg-gray-700 rounded-lg text-white'>FYP</button>
  //             </div>}
  //         </div>
  //         <div className='w-40'>
  //           <button 
  //             className='p-3 w-full border border-green-700 rounded-2xl text-center' 
  //             onClick={()=>navigate("/gemini")}>
  //              Ask Habita
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  // )
  return (
    <div className='bg-bg text-text-primary w-64 min-h-screen flex flex-col border-r border-secondary shadow-lg rounded-r-xl'>
      
      {/* Streak and Leaderboard */}
      <div className='flex justify-between items-center mt-6 px-4 py-2'>
        <p className='text-sm font-semibold text-text-muted'>
          Current Streak:
          <span className='text-accent ml-1 font-bold'>{streak?.streak || 0}</span>
        </p>
        <div className='relative group'>
          <button 
            onClick={() => navigate("/leaderboard")} 
            className='hover:scale-110 transition-transform p-1 rounded-md hover:bg-primary'
          >
            <FaChartBar size={20} className='text-secondary' />
          </button>
          <div className='absolute top-8 left-1/2 transform -translate-x-1/2 bg-primary text-bg text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-10 shadow-sm'>
            Leaderboard
          </div>
        </div>
      </div>
  
      {/* Navigation Buttons */}
      <div className='flex flex-col items-center gap-4 mt-10 px-4 space-y-2'>
  
        <button 
          className='w-full py-2.5 text-sm bg-bg border border-secondary rounded-lg hover:bg-primary hover:text-bg transition shadow-sm text-text-primary font-medium'
          onClick={() => navigate("/friends", { state: { currentUser } })}
        >
          Friend List
        </button>
  
        <button 
          className='w-full py-2.5 text-sm bg-bg border border-secondary rounded-lg hover:bg-primary hover:text-bg transition shadow-sm text-text-primary font-medium'
          onClick={() => navigate("/friendforchat")}
        >
          Chat
        </button>
  
        <button 
          className='w-full py-2.5 text-sm bg-bg border border-secondary rounded-lg hover:bg-primary hover:text-bg transition shadow-sm text-text-primary font-medium'
          onClick={() => navigate("/habits")}
        >
          Habits
        </button>
        <button 
          className='w-full py-2.5 text-sm bg-bg border border-secondary rounded-lg hover:bg-primary hover:text-bg transition shadow-sm text-text-primary font-medium'
          onClick={() => navigate("/groups")}
        >
          Group Chats
        </button>
  
        {/* Posts with Dropdown */}
        <div className='w-full'>
          <button 
            className='w-full py-2.5 text-sm bg-bg border border-secondary rounded-lg hover:bg-primary hover:text-bg transition shadow-sm text-text-primary font-medium'
            onClick={() => setShowPostOptions(!showPostOptions)}
          >
            Posts
          </button>
          {showPostOptions && (
            <div className='mt-2 flex flex-col gap-2'>
              <button 
                onClick={() => navigate("/new-post")} 
                className='w-full py-2 bg-primary rounded-lg hover:bg-accent transition text-sm text-bg shadow-sm'
              >
                Create Post
              </button>
              <button 
                onClick={() => navigate("/fyp")} 
                className='w-full py-2 bg-primary rounded-lg hover:bg-accent transition text-sm text-bg shadow-sm'
              >
                FYP
              </button>
            </div>
          )}
        </div>
  
        <button 
          className='w-full py-2.5 text-sm bg-bg border border-secondary rounded-lg hover:bg-primary hover:text-bg transition shadow-sm text-text-primary font-medium'
          onClick={() => navigate("/gemini")}
        >
          Ask Habita
        </button>
      </div>
    </div>
  );
  
}
