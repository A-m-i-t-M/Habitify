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
    <div className='bg-gray-900 text-white w-64 min-h-screen flex flex-col border border-red-800 rounded-r-2xl shadow-lg'>
      
      {/* Streak and Leaderboard */}
      <div className='flex justify-between items-center mt-6 px-4'>
        <p className='text-sm font-semibold'>
          Current Streak:
          <span className='text-red-500 ml-1'>{streak?.streak || 0}</span>
        </p>
        <div className='relative group'>
          <button 
            onClick={() => navigate("/leaderboard")} 
            className='hover:scale-110 transition-transform'
          >
            <FaChartBar size={20} className='text-green-400' />
          </button>
          <div className='absolute top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-10'>
            Leaderboard
          </div>
        </div>
      </div>
  
      {/* Navigation Buttons */}
      <div className='flex flex-col items-center gap-5 mt-12 px-4'>
  
        <button 
          className='w-full py-2 text-sm bg-gray-800 border border-green-500 rounded-xl hover:bg-gray-700 transition'
          onClick={() => navigate("/friends", { state: { currentUser } })}
        >
          Friend List
        </button>
  
        <button 
          className='w-full py-2 text-sm bg-gray-800 border border-green-500 rounded-xl hover:bg-gray-700 transition'
          onClick={() => navigate("/friendforchat")}
        >
          Chat
        </button>
  
        <button 
          className='w-full py-2 text-sm bg-gray-800 border border-green-500 rounded-xl hover:bg-gray-700 transition'
          onClick={() => navigate("/habits")}
        >
          Habits
        </button>
  
        {/* Posts with Dropdown */}
        <div className='w-full'>
          <button 
            className='w-full py-2 text-sm bg-gray-800 border border-green-500 rounded-xl hover:bg-gray-700 transition'
            onClick={() => setShowPostOptions(!showPostOptions)}
          >
            Posts
          </button>
          {showPostOptions && (
            <div className='mt-2 flex flex-col gap-2'>
              <button 
                onClick={() => navigate("/new-post")} 
                className='w-full py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition text-sm'
              >
                Create Post
              </button>
              <button 
                onClick={() => navigate("/fyp")} 
                className='w-full py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition text-sm'
              >
                FYP
              </button>
            </div>
          )}
        </div>
  
        <button 
          className='w-full py-2 text-sm bg-gray-800 border border-green-500 rounded-xl hover:bg-gray-700 transition'
          onClick={() => navigate("/gemini")}
        >
          Ask Habita
        </button>
      </div>
    </div>
  );
  
}
