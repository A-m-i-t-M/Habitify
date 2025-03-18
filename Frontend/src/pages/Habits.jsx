import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

export default function Habits() {
  const {currentUser} = useSelector(state => state.user);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHabitsOptions, setShowHabitsOptions] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  
//   const [formData, setFormData] = useState({
//     description: '',
//     days: '',
//     hours: '',
//     minutes: '',
//   });

  const [formData, setFormData] = useState({
    description: "",
    days: "",
    duration: { hours: 0, minutes: 0 }, 
  });

  const handleChange = (e)=>{
    let {name, value} = e.target;
    if(name === "days" || name === "hours" || name === "minutes"){
        value = value.replace(/\D/g, '');
    }
    setFormData((prev) => {
        let updatedData = { ...prev };
    
        if (name === "days") {
          updatedData.days = value;
        } else if (name === "hours" || name === "minutes") {
          let newDuration = { ...prev.duration };
    
          if (name === "hours") {
            newDuration.hours = parseInt(value) || 0;
          } else if (name === "minutes") {
            let totalMinutes = parseInt(value) || 0;
            newDuration.hours += Math.floor(totalMinutes / 60); 
            newDuration.minutes = totalMinutes % 60; 
          }
    
          updatedData.duration = newDuration;
        } else {
          updatedData[name] = value;
        }
    
        return updatedData;
      });
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    try {
        const payload = {
          ...formData,
          days : parseInt(formData.days) || 0,
          duration:{
            hours: parseInt(formData.duration.hours) || 0,
            minutes: parseInt(formData.duration.minutes) || 0,
          }
        };
        const res = await fetch("/backend/goals/create",{
            method : "POST",
            headers:{
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(payload),
        })
        const data = await res.json();
        if(!res.ok){
            setLoading(false);
            setError(data.message);
            return;
        }
        setLoading(false);
        navigate("/all-habits");
    } catch (error) {
        setLoading(false);
        setError(error.message);
    }
  }

  console.log(formData);
  

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
        <p className='text-center mt-2 text-3xl font-bold italic'>Add Habit</p>
        <form className='flex flex-col p-8 items-center justify-center gap-4 border m-2 rounded-2xl' onSubmit={handleSubmit}>
            <textarea rows="5" placeholder='Enter Goal Description' name='description' id='description' onChange={handleChange} value={formData.description} className="w-full p-2 mt-1 text-black border rounded-2xl text-center"/>
            <div className='w-full px-24'>
                <input placeholder='Enter the Time Period [Days - numeric]' type='text' name='days' value={formData.days} onChange={handleChange} className='w-full p-2 mt-1 text-black border rounded-2xl text-center'/>
            </div>
            <div className='flex  gap-6 w-1/2'>
                <input placeholder='Enter the hours per day' type='text' name='hours' value={formData.duration.hours} onChange={handleChange} className='p-2 mt-1 text-black border rounded-2xl w-full text-center'/>
                <input placeholder='Enter the minutes per day' type='text' name='minutes' value={formData.duration.minutes} onChange={handleChange} className='p-2 mt-1 text-black border rounded-2xl w-full text-center'/>
            </div>
            <button className='bg-green-600 text-white rounded-2xl p-2 w-40'>Create</button>
        </form>
      </div>
    </div>
  )
}
