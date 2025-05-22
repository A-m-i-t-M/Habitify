import { useEffect, useState } from 'react'
import SideBar from '../../components/SideBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Habits() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
    
  const [showForm, setShowForm] = useState(() => {
    return JSON.parse(localStorage.getItem("showForm")) ?? true;
  });
  const [showGoals, setShowGoals] = useState(() => {
    return JSON.parse(localStorage.getItem("showGoals")) ?? false;
  });
  const [addingGoal, setAddingGoal] = useState(() => {
    return localStorage.getItem("editMode") === "true" ? false : true;
  });
  const [updatingGoal, setUpdatingGoal] = useState(() => {
    return localStorage.getItem("editMode") === "true";
  });
  const [updateMe, setUpdateMe] = useState(() => {
    const saved = localStorage.getItem("editGoal");
    return saved ? JSON.parse(saved) : null;
  });
 
  const initialFormData = {
    description: "",
    days: "",
    duration: { hours: 0, minutes: 0 }, 
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    localStorage.setItem("showForm", JSON.stringify(showForm));
    localStorage.setItem("showGoals", JSON.stringify(showGoals));
    localStorage.setItem("editMode", updatingGoal);
    localStorage.setItem("editGoal", JSON.stringify(updateMe));
  }, [showForm, showGoals, updatingGoal, updateMe]);

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
      setLoading(false);
    }
    getGoals();
  },[]);

  const handleChange = (e)=>{
    let {name, value} = e.target;
    if(["days", "hours", "minutes"].includes(name)){
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
    setLoading(true);
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
            setError(data.message);
            return;
        }
        const updatedGoalsRes = await fetch("/backend/goals/");
        const updatedGoalsData = await updatedGoalsRes.json();

        if (updatedGoalsRes.ok) {
          setGoals(updatedGoalsData.goals);
        }
        setSuccessMessage("Habit created successfully!");
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
    } catch (error) {
        setError(error.message);
    } finally{
        setLoading(false);
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
            setError(data.message);
            return;
        }

        const updatedGoalsRes = await fetch("/backend/goals/");
        const updatedGoalsData = await updatedGoalsRes.json();
    
        if (!updatedGoalsRes.ok) {
          setError(updatedGoalsData.message);
          return;
        }
      
      setGoals(updatedGoalsData.goals);
      setShowForm(false);
      setShowGoals(true);
      setAddingGoal(true);
      setUpdatingGoal(false);
      setFormData(initialFormData);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally{
      setLoading(false);
    }
  }
  
  const handleDelete = async(goalId)=>{
    setLoading(true);
    try {
      const res = await fetch("/backend/goals/delete", {
        method : "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({goalId}),
      })

      const data = await res.json();
      if(!res.ok){
        setError(data.message);
        return;
      }

      setGoals(prevGoals => {
        const updatedGoals = prevGoals.filter(goal => goal._id !== goalId);
      
        if (updatedGoals.length === 0) {
          setShowForm(true);
          setShowGoals(false);
          setAddingGoal(true);
          setUpdatingGoal(false);
          setFormData(initialFormData);
          localStorage.setItem("showForm", "true");
          localStorage.setItem("showGoals", "false");
          localStorage.removeItem("editMode");
          localStorage.removeItem("editGoal");
        }
        return updatedGoals;
      })
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally{
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen bg-black text-white'>
      <SideBar/>
      <div className='flex-1 min-h-full px-8 py-6'>
        {addingGoal && showForm && (
          <h1 className='text-2xl font-light text-white mb-8 tracking-widest uppercase'>
            Create Habit
          </h1>
        )}
        
        {updatingGoal && showForm && (
          <h1 className='text-2xl font-light text-white mb-8 tracking-widest uppercase'>
            Update Habit
          </h1>
        )}
        
        {showForm && (
          <form 
            className='flex flex-col gap-6 max-w-xl mx-auto' 
            onSubmit={addingGoal ? handleSubmit : updateGoal}
          >
            <div className="relative">
              <label 
                htmlFor="description"
                className='text-white/50 text-xs tracking-wider uppercase font-light mb-2 block'
              >
                Description
              </label>
              <textarea 
                rows="3" 
                placeholder={addingGoal ? 'Enter your habit description' : ''} 
                name='description' 
                id='description' 
                onChange={handleChange} 
                value={formData.description || (updatingGoal ? updateMe?.description : '')} 
                className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 resize-none"
              />
            </div>
            
            <div className="relative">
              <label 
                htmlFor="days"
                className='text-white/50 text-xs tracking-wider uppercase font-light mb-2 block'
              >
                Days
              </label>
              <input 
                placeholder="Enter number of days" 
                type='text' 
                name='days' 
                id='days'
                value={formData.days || (updatingGoal ? updateMe?.days : '')} 
                onChange={handleChange} 
                className='w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300'
              />
            </div>
            
            <div className='flex gap-6'>
              <div className="relative flex-1">
                <label 
                  htmlFor="hours"
                  className='text-white/50 text-xs tracking-wider uppercase font-light mb-2 block'
                >
                  Hours
                </label>
                <input 
                  placeholder="Hours" 
                  type='text' 
                  name='hours'
                  id='hours'
                  value={formData.duration.hours || (updatingGoal ? updateMe?.duration?.hours : '')} 
                  onChange={handleChange} 
                  className='w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300'
                />
              </div>
              
              <div className="relative flex-1">
                <label 
                  htmlFor="minutes"
                  className='text-white/50 text-xs tracking-wider uppercase font-light mb-2 block'
                >
                  Minutes
                </label>
                <input 
                  placeholder="Minutes" 
                  type='text' 
                  name='minutes'
                  id='minutes' 
                  value={formData.duration.minutes || (updatingGoal ? updateMe?.duration?.minutes : '')} 
                  onChange={handleChange} 
                  className='w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300'
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <button 
                type="submit"
                className='px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light flex-1'
                disabled={loading}
              >
                {loading ? 'Processing...' : (addingGoal ? 'Create' : 'Update')}
              </button>
              
              {updatingGoal && (
                <button 
                  type="button"
                  className='px-6 py-3 bg-transparent border border-white/30 text-white hover:border-white transition-colors duration-300 text-xs uppercase tracking-wider font-light flex-1'
                  onClick={() => {
                    setAddingGoal(true);
                    setUpdatingGoal(false);
                    setUpdateMe(null);
                    setFormData(initialFormData);
                    localStorage.removeItem("editMode");
                    localStorage.removeItem("editGoal");  
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            
            {successMessage && (
              <div className='text-white/70 text-xs mt-2 tracking-wider text-center'>
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className='text-red-400 text-xs mt-2 tracking-wider text-center'>
                {typeof error === 'string' ? error : "An error occurred"}
              </div>
            )}
          </form>
        )}
        
        <div className="flex justify-between items-center my-8">
          {(addingGoal || showGoals) && (
            <button 
              className={`px-6 py-3 text-xs uppercase tracking-wider font-light
                ${showGoals 
                  ? "bg-transparent border border-white/30 text-white hover:border-white" 
                  : "bg-white text-black hover:bg-gray-200"} 
                transition-colors duration-300
                ${!showGoals && goals.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`} 
              onClick={() => {
                setShowForm(!showForm);
                setShowGoals(!showGoals);
                setFormData(initialFormData);
                setAddingGoal(true);
                setUpdatingGoal(false);
                setSuccessMessage('');
              }}
              disabled={!showGoals && goals.length === 0}
            >
              {showGoals ? "Hide Habits" : "View All Habits"}
            </button>
          )}
        </div>

        {showGoals && (
          <div className='mt-8'>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : goals.length === 0 ? (
              <p className="text-white/50 text-center">No habits found</p>
            ) : (
              <AnimatePresence>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {goals.map((goal) => (
                    <motion.div 
                      key={goal._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className='bg-black border border-white/20 p-5 hover:border-white/50 transition-colors duration-300'
                    >
                      <div className="mb-4">
                        <h3 className="text-base font-light tracking-wide mb-4">{goal.description}</h3>
                        <div className='flex justify-between items-center text-xs text-white/70 tracking-wider'>
                          <div className="space-x-2">
                            <span>
                              Days: {goal.days}
                            </span>
                          </div>
                          <div>
                            <span>
                              {goal.duration.hours}h {goal.duration.minutes}m
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className='flex gap-3 mt-6'>
                        <button 
                          className='flex-1 py-2 text-xs text-black bg-white hover:bg-gray-200 transition-colors duration-300 uppercase tracking-wider'
                          onClick={() => {
                            setShowForm(true); 
                            setShowGoals(false);
                            setAddingGoal(false);
                            setUpdatingGoal(true);
                            setUpdateMe(goal);
                            localStorage.setItem("editMode", "true");
                            localStorage.setItem("editGoal", JSON.stringify(goal));
                            localStorage.setItem("showForm", "true");
                            localStorage.setItem("showGoals", "false");
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className='flex-1 py-2 text-xs border border-white/30 hover:border-white transition-colors duration-300 uppercase tracking-wider' 
                          onClick={() => handleDelete(goal._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
