import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import SideBar from '../../components/SideBar';

export default function Habits() {
  const {currentUser} = useSelector(state => state.user);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [showGoals, setShowGoals] = useState(false);
  const [addingGoal, setAddingGoal] = useState(true);
  const [updatingGoal, setUpdatingGoal] = useState(null);
  const [updateMe, setUpdateMe] = useState(null);

  const initialFormData = {
    description: "",
    days: "",
    duration: { hours: 0, minutes: 0 }, 
  };
  const [formData, setFormData] = useState(initialFormData);


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
  };

  const updateGoal = async(e)=>{
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        goalId : updateMe._id,
        days : parseInt(formData.days) || updateMe.days,
        duration:{
          hours: parseInt(formData.duration.hours) || updateMe.duration.hours,
          minutes: parseInt(formData.duration.minutes) || updateMe.duration.minutes,
        }
      };

      const res = await fetch("/backend/goals/update",{
        method : "POST",
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
        if(!res.ok){
            setLoading(false);
            setError(data.message);
            return;
        }

        const updatedGoalsRes = await fetch("/backend/goals/");
        const updatedGoalsData = await updatedGoalsRes.json();
    
        if (!updatedGoalsRes.ok) {
          setLoading(false);
          setError(updatedGoalsData.message);
          return;
        }
      
      setGoals(updatedGoalsData.goals);
      setLoading(false);
      setShowForm(!showForm);
      setShowGoals(!showGoals);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }
  
  const handleDone = (goal) => {
    setUpdatingGoal(goal);
    setShowGoals(false);
    setShowForm(true);
    setFormData(goal); 
  };

  console.log("adding: ",addingGoal);
  console.log("updating",updatingGoal);
  console.log("showForm", showForm);
  console.log("showGoals", showGoals, "\n");
  
  

  return (
    <div className='flex  h-screen  bg-gray-800'>
      <SideBar/>
      <div className='border border-red-800 flex-1 min-h-full'>
        {addingGoal && showForm && <p className='text-center mt-2 text-3xl font-bold italic'>Add Habit</p>}
        {updatingGoal && showForm && <p className='text-center mt-2 text-3xl font-bold italic'>Edit Goal</p>}
        {showForm && (<form className='flex flex-col p-8 items-center justify-center gap-4 border m-2 rounded-2xl' onSubmit={addingGoal ? handleSubmit : updateGoal}>
            <textarea rows="5" 
            placeholder={addingGoal ? 'Enter Goal Description' : updateMe?.description || ''} 
            name='description' id='description' onChange={handleChange} value={formData.description} className="w-full p-2 mt-1 text-black border rounded-2xl text-center"/>
            <div className='w-full px-24'>
                <input 
                placeholder={addingGoal ? 'Enter the Time Period [Days - numeric]' : updateMe?.days || ''}  
                type='text' name='days' value={formData.days} onChange={handleChange} className='w-full p-2 mt-1 text-black border rounded-2xl text-center'/>
            </div>
            <div className='flex  gap-6 w-1/2'>
                <input 
                placeholder={addingGoal ? 'Enter the hours per day' : updateMe.duration?.hours || ''} 
                type='text' name='hours' value={formData.duration.hours} onChange={handleChange} className='p-2 mt-1 text-black border rounded-2xl w-full text-center'/>
                <input 
                placeholder={addingGoal ? 'Enter the minutes per day' : updateMe?.duration?.minutes || ''} 
                type='text' name='minutes' value={formData.duration.minutes} onChange={handleChange} className='p-2 mt-1 text-black border rounded-2xl w-full text-center'/>
            </div>
            <button className='bg-green-600 text-white rounded-2xl p-2 w-40'>{addingGoal ? 'Create' : 'Update'}</button>
            {updatingGoal && <button className='bg-red-600 text-white rounded-2xl p-2 w-40'
            onClick={()=>{
              setAddingGoal(!addingGoal);
              setUpdatingGoal(!updatingGoal);
              setFormData(initialFormData);
            }}>
              Cancel</button>}
        </form>)}
        
        {(addingGoal || showGoals)&&(
          <div className={`flex ${!showGoals ? "justify-center" : "justify-start"} mt-4`}>
            <button 
              className={`p-2 w-40 rounded-2xl text-white ${showGoals ? "bg-red-600 ml-4" : "bg-blue-600"} `} 
              onClick={() => {
                setShowForm(!showForm);
                setShowGoals(!showGoals);
                setFormData(initialFormData);
                setAddingGoal(true);
                setUpdatingGoal(null);
              }}
            >
              {showGoals ? "Hide Habits" : "Show Habits"}
            </button>
          </div>
        )}


        {showGoals && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 m-4'>
            {goals.map((goal) => (
              <div key={goal._id}
                className='bg-[#FFFAE3] border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 p-6 cursor-pointer bg-gradient-to-br from-slate-300 to-slate-700 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-500'>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-orange-300">{goal.description}</h3>
                  </div>
                  <div className='flex justify-between items-center gap-2'>
                    <p className='font-bold'>Hours: <span className='font-medium'>{goal.duration.hours}</span></p>
                    <p className='font-bold'>Minutes: <span className='font-medium'>{goal.duration.minutes}</span></p>
                  </div>
                  <div className='flex flex-col justify-evenly gap-4 items-center mt-3'>
                    <button className='bg-green-700 border rounded-xl w-full' 
                      onClick={() => {
                        setShowForm(true); 
                        setShowGoals(false);
                        setAddingGoal(!addingGoal);
                        setUpdatingGoal(!updatingGoal);
                        setUpdateMe(goal)
                        
                      }}>
                      Update
                    </button>
                    <button className='bg-red-700 border rounded-xl w-full' onClick={()=> handleDelete(goal._id)}>Delete</button>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
