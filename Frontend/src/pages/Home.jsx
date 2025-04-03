import React, { useEffect, useState } from 'react'
import SideBar from '../../components/SideBar';

export default function Home() {

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyGoals, setDailyGoals] = useState([]);


  useEffect(()=>{
    const todaysGoals = async()=>{
      setLoading(true);
      try {
        const res = await fetch("/backend/goals/dailygoals");
        const data = await res.json();
        if(!res.ok){
          setError(data.message);
          setLoading(false);
          return;
        }
        setDailyGoals(data.goals);
        setLoading(false);
        setError(null);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    todaysGoals();
  },[]);


  const handleMarkAsDone = async(goalId)=>{
    setLoading(true);
    try {
      const res = await fetch("/backend/goals/done",{
        method : "POST",
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({goalId}),
      });

      const data = await res.json();
      if(!res.ok){
        setError(data.message);
        setLoading(false);
        return;
      };

      setDailyGoals(prevGoals=> prevGoals.filter(goal=> goal._id !== goalId));
      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  console.log(dailyGoals);
  


  return (
    <div className='flex  h-screen  bg-gray-800'>
      <SideBar/>
      <div className='border border-red-800 flex-1 h-full'>
          <div className='mx-auto p-4 h-full flex flex-col gap-4 items-center text-center'>
            <p className='text-center text-2xl font-semibold italic'>Today's Goals</p>
              {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : dailyGoals.length === 0 ? (
              <p className="text-gray-400">No pending goals for today!</p>
            ) : (
              <ul className="w-full flex flex-col gap-4">
                {dailyGoals.map(goal => (
                  <li 
                    key={goal._id} 
                    className="flex justify-between items-center bg-gray-800 px-4 py-3 rounded-lg shadow-md"
                  >
                    <span className="text-white font-medium">{goal.description}</span>
                    <button 
                      onClick={() => handleMarkAsDone(goal._id)} 
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow"
                    >
                      Done
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
      </div>
    </div>
  )
}