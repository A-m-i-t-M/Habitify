import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

export default function ViewHabits() {
  const {currentUser} = useSelector(state => state.user);
  const [showHabitsOptions, setShowHabitsOptions] = useState(false);
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);

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
              setGoals(data);
          } catch (error) {
              setError(error.message);
          }
      }
      getGoals();
    },[]);

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
          <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' onClick={() =>  navigate("/posts") }>Posts</button>
        </div>

      </div>
      <div className='border border-red-800 flex-1 h-full'>
        <p className='text-center mt-2 text-3xl font-bold italic'>All Habits</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>

        </div>
      </div>
    </div>
  )
}
