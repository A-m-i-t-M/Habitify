import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

export default function ViewHabits() {
  const {currentUser} = useSelector(state => state.user);
  const [showHabitsOptions, setShowHabitsOptions] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hideMe, setHideMe] = useState(false);

  useEffect(()=>{
      const getGoals = async()=>{
          setLoading(true);
          try {
              const res = await fetch("/backend/goals/");
              const data = await res.json();
              if(!res.ok){
                  setError(data.message);
                  return;
              }
              setGoals(data.goals);
          } catch (error) {
              setError(error.message);
          }
      }
      getGoals();
    },[]);

    // console.log(goals);
    
    const handleClicked = async(gID)=>{

    }

    const handleDelete = async(goalId)=>{
      console.log(goalId);
      
      try {
        setLoading(true);
        const res = await fetch("/backend/goals/delete",{
          method : "POST",
          headers: {
            'Content-Type' : 'application/json',
          },
          body : JSON.stringify({goalId}),
        })
        const data = await res.json();
        setGoals(goals => goals.filter(goal => goal._id !== goalId));
        // setPendingRequests(pendingRequests.filter(req => req._id !== friend._id));

        setLoading(false);
        setError(null);
      } catch (error) {
        setLoading(false);
        setError(error.message);
      }
    }

    return (
        <div className='flex  h-screen  bg-gray-800'>
        <div className='border border-red-800  w-64 h-full flex flex-col'>
        <p className='px-2 py-4 font-semibold under mt-6 ml-3'>Current Streak: <span className='text-red-800'>69</span></p>

        <div className='flex flex-col items-center justify-center gap-8 mt-10'>
          <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/friends", {state : {currentUser}}) }>Friendlist</button>
          {/* <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/habits") }>Habits</button> */}
          <div className='w-40'>
            <button 
              className='p-3 w-full border border-green-700 rounded-2xl text-center' 
              onClick={() => setShowHabitsOptions(!showHabitsOptions)}
            >
              Habits
            </button>
            {showHabitsOptions && (
              <div className='mt-2 flex flex-col gap-2'>
                <button 
                  className='p-2 bg-gray-700 text-white rounded-lg' 
                  onClick={() => navigate("/habits")}
                >
                  Add Habit
                </button>
                <button 
                  className='p-2 bg-gray-700 text-white rounded-lg' 
                  onClick={() => navigate("/all-habits")}
                >
                  View Habits
                </button>
              </div>
            )}
          </div>
          {/* <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/posts") }>Posts</button> */}
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
      <div className='border border-red-800 flex-1 h-full'>
        <p className='text-center mt-2 text-3xl font-bold italic'>All Habits</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 m-4'>
            {goals.map((goal)=>(
              <div key={goal._id}
                   className='bg-[#FFFAE3] border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 p-6 cursor-pointer bg-gradient-to-br from-slate-300 to-slate-700  dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-500'>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-orange-300">{goal.description}</h3>
                        </div>
                        <div className='flex justify-between items-center gap-2'>
                          <p className='font-bold'>Hours: <span className='font-medium'>{goal.duration.hours}</span></p>
                          <p className='font-bold'>Minutes: <span className='font-medium'>{goal.duration.minutes}</span></p>
                        </div>
                        <div className='flex flex-col justify-evenly gap-4 items-center mt-3'>
                          <button className='bg-green-700 border rounded-xl w-full' onClick={()=>handleClicked(goal._id)}>Done</button>
                          <button className='bg-red-700 border rounded-xl w-full' onClick={()=> handleDelete(goal._id)}>Delete</button>
                        </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

{/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mandirs.map((mandir) => (
          <div
            key={mandir._id}
            className="bg-[#FFFAE3] border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 p-6 cursor-pointer bg-gradient-to-br from-yellow-300 to-orange-300  dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-500"
            onClick={() => handleCardClick(mandir)}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-orange-300">{mandir.username}</h3>
            </div>
            <p className="text-gray-600 text-base dark:text-neutral-200">{mandir.description}</p>
            <div className="mt-4">
              <button className="bg-orange-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-orange-700 transition-colors duration-300">
                Book Visit
              </button>
            </div>
          </div>
        ))}
      </div> */}
