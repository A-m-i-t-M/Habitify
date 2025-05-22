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
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState(null);
  
  useEffect(() => {
    const getMyStreak = async() => {
      try {
        const res = await fetch("/backend/goals/streak");
        const data = await res.json();
        if(!res.ok){
          setError(data.message || "Failed to fetch streak");
          setLoading(false);
          return;
        }
        setStreak(data);
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching streak:", error);
        setError(error.message || "An error occurred");
        setLoading(false);
      }
    };

    getMyStreak();
    
    // Refresh streak data every 5 minutes
    const intervalId = setInterval(getMyStreak, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  },[]);
  
  useEffect(() => {
    const getUserProgress = async() => {
      setProgressLoading(true);
      try {
        const res = await fetch("/backend/goals/progress");
        const data = await res.json();
        if(!res.ok){
          setProgressError(data.message || "Failed to fetch progress");
          setProgressLoading(false);
          return;
        }
        setProgress(data);
        setProgressError(null);
        setProgressLoading(false);
      } catch (error) {
        console.error("Error fetching progress:", error);
        setProgressError(error.message || "An error occurred");
        setProgressLoading(false);
      }
    };

    getUserProgress();
    
    // Refresh progress data every 2 minutes to show updated completion
    const intervalId = setInterval(getUserProgress, 2 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  },[]);

  return (
    <div className='bg-black w-64 min-h-screen flex flex-col border-r border-white/10 shadow-lg'>
      
      {/* Streak and Leaderboard */}
      <div className='flex justify-between items-center mt-8 px-6'>
        <div className='text-sm font-light tracking-wide'>
          <span className='text-white/70'>STREAK</span>
          <div className='text-white text-lg font-normal mt-1'>
            {loading ? (
              <span className="text-white/50">...</span>
            ) : error ? (
              <span className="text-white/50">0</span>
            ) : (
              streak?.streak || 0
            )}
          </div>
        </div>
        <div className='relative group'>
          <button 
            onClick={() => navigate("/leaderboard")} 
            className='hover:scale-110 transition-transform duration-300'
          >
            <FaChartBar size={18} className='text-white hover:text-white/70 transition-colors duration-300' />
          </button>
          <div className='absolute top-8 right-0 bg-white text-black text-[10px] rounded-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-wider'>
            Leaderboard
          </div>
        </div>
      </div>
      
      {/* Daily Progress */}
      <div className='mt-6 px-6'>
        <div className='text-sm font-light tracking-wide'>
          <span className='text-white/70'>TODAY&apos;S PROGRESS</span>
          <div className='mt-2'>
            {progressLoading ? (
              <div className="h-1 bg-white/10 rounded-full w-full"></div>
            ) : progressError ? (
              <div className="h-1 bg-white/10 rounded-full w-full"></div>
            ) : (
              <>
                <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${progress?.progress || 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {progress?.completedGoals || 0} / {progress?.totalGoals || 0} goals completed
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  
      {/* Navigation Buttons */}
      <div className='flex flex-col gap-4 mt-12 px-6'>
  
        <button 
          className='w-full py-3 text-xs text-white bg-transparent border border-white/20 hover:border-white transition-colors duration-300 rounded-sm font-light tracking-wider uppercase'
          onClick={() => navigate("/friends", { state: { currentUser } })}
        >
          Friends
        </button>
  
        <button 
          className='w-full py-3 text-xs text-white bg-transparent border border-white/20 hover:border-white transition-colors duration-300 rounded-sm font-light tracking-wider uppercase'
          onClick={() => navigate("/friendforchat")}
        >
          Chat
        </button>
  
        <button 
          className='w-full py-3 text-xs text-white bg-transparent border border-white/20 hover:border-white transition-colors duration-300 rounded-sm font-light tracking-wider uppercase'
          onClick={() => navigate("/habits")}
        >
          Habits
        </button>

        <button 
          className='w-full py-3 text-xs text-white bg-transparent border border-white/20 hover:border-white transition-colors duration-300 rounded-sm font-light tracking-wider uppercase'
          onClick={() => navigate("/groups")}
        >
          Groups
        </button>
  
        {/* Posts with Dropdown */}
        <div className='w-full'>
          <button 
            className='w-full py-3 text-xs text-white bg-transparent border border-white/20 hover:border-white transition-colors duration-300 rounded-sm font-light tracking-wider uppercase'
            onClick={() => setShowPostOptions(!showPostOptions)}
          >
            Posts
          </button>
          {showPostOptions && (
            <div className='mt-2 space-y-2 pl-2 border-l border-white/10 ml-4'>
              <button 
                onClick={() => navigate("/new-post")} 
                className='w-full py-2 text-[10px] text-white/70 hover:text-white transition-colors duration-300 text-left font-light tracking-wider uppercase'
              >
                Create Post
              </button>
              <button 
                onClick={() => navigate("/fyp")} 
                className='w-full py-2 text-[10px] text-white/70 hover:text-white transition-colors duration-300 text-left font-light tracking-wider uppercase'
              >
                For You
              </button>
            </div>
          )}
        </div>
  
        <button 
          className='w-full py-3 text-xs text-white bg-transparent border border-white/20 hover:border-white transition-colors duration-300 rounded-sm font-light tracking-wider uppercase'
          onClick={() => navigate("/gemini")}
        >
          Ask Habita
        </button>
      </div>
    </div>
  );
}
