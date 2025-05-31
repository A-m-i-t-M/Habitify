import { useEffect, useState } from 'react';
import SideBar from '../../components/SideBar'; // Assuming correct path
import { API_CALL_PREFIX } from '../../config.js';
export default function Habits() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Keep track of overall loading for initial fetch
  const [actionLoading, setActionLoading] = useState(false); // For specific actions like submit/update/delete
  const token = localStorage.getItem("token");
  const [goals, setGoals] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Initial state from localStorage with nullish coalescing for safety
  const [showForm, setShowForm] = useState(() => {
    return JSON.parse(localStorage.getItem("showForm")) ?? true;
  });
  const [showGoals, setShowGoals] = useState(() => {
    return JSON.parse(localStorage.getItem("showGoals")) ?? false;
  });
  const [addingGoal, setAddingGoal] = useState(() => {
    // If not in editMode, default to adding a goal.
    return localStorage.getItem("editMode") === "true" ? false : true;
  });
  const [updatingGoal, setUpdatingGoal] = useState(() => {
    return localStorage.getItem("editMode") === "true";
  });
  const [updateMe, setUpdateMe] = useState(() => {
    const saved = localStorage.getItem("editGoal");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      // If JSON parsing fails, return null and clear invalid localStorage item
      localStorage.removeItem("editGoal");
      return null;
    }
  });
 
  const initialFormData = {
    description: "",
    days: "",
    duration: { hours: 0, minutes: 0 }, 
  };
  const [formData, setFormData] = useState(initialFormData);

  // Effect to save UI state to localStorage
  useEffect(() => {
    localStorage.setItem("showForm", JSON.stringify(showForm));
    localStorage.setItem("showGoals", JSON.stringify(showGoals));
    if (updatingGoal && updateMe) {
      localStorage.setItem("editMode", "true");
      localStorage.setItem("editGoal", JSON.stringify(updateMe));
    } else {
      localStorage.removeItem("editMode");
      localStorage.removeItem("editGoal");
    }
  }, [showForm, showGoals, updatingGoal, updateMe]);

  // Effect to fetch initial goals
  useEffect(() => {
    const getGoals = async () => {
      setLoading(true); // For initial page load
      setError(null);
      try {
        const res = await fetch(`${API_CALL_PREFIX}/backend/goals/`,{
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ message: "Failed to fetch goals and parse error response." }));
          throw new Error(data.message || "Server error while fetching goals.");
        }
        const data = await res.json();
        setGoals(data.goals || []); // Ensure goals is an array
      } catch (err) {
        setError(err.message);
        setGoals([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    getGoals();
  }, []); // Empty dependency array: runs once on mount

  // Pre-fill form when entering update mode
  useEffect(() => {
    if (updatingGoal && updateMe) {
      setFormData({
        description: updateMe.description || "",
        days: updateMe.days?.toString() || "", // Ensure days is a string for input
        duration: { 
          hours: updateMe.duration?.hours || 0, 
          minutes: updateMe.duration?.minutes || 0 
        },
      });
    } else {
      setFormData(initialFormData); // Reset form if not updating
    }
  }, [updatingGoal, updateMe]);


  const handleChange = (e) => {
    let { name, value } = e.target;

    // Allow only numbers for these fields
    if (["days", "hours", "minutes"].includes(name)) {
        value = value.replace(/\D/g, ''); // Remove non-digit characters
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
            // Allow up to 3 digits for minutes initially, then parse
            const numValue = parseInt(value) || 0;
            newDuration.hours = (prev.duration.hours || 0) + Math.floor(numValue / 60);
            newDuration.minutes = numValue % 60;
          }
          updatedData.duration = newDuration;
        } else {
          updatedData[name] = value;
        }
        return updatedData;
      });
  };

  const handleApiCall = async (url, method, body) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => {
          if (!res.ok) throw new Error("Operation failed and server sent non-JSON response.");
          return { message: "Operation successful but server sent non-JSON response."}; // Should not happen for success
      });

      if (!res.ok) {
        throw new Error(data.message || "An API error occurred.");
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw to be caught by caller
    } finally {
      setActionLoading(false);
    }
  };

  const refreshGoals = async () => {
    // This function can be used to silently refresh goals without global loading
    // For now, we re-fetch explicitly in handlers.
    try {
        const res = await fetch(`${API_CALL_PREFIX}/backend/goals/`,{
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Failed to refetch goals."}));
          throw new Error(errorData.message);
        }
        const updatedGoalsData = await res.json();
        setGoals(updatedGoalsData.goals || []);
    } catch (err) {
        setError(err.message); // Show error if refetch fails
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      description: formData.description,
      days: parseInt(formData.days) || 0,
      duration: {
        hours: parseInt(formData.duration.hours) || 0,
        minutes: parseInt(formData.duration.minutes) || 0,
      }
    };
    if (!payload.description || payload.days <= 0) {
        setError("Description and a valid number of days are required.");
        return;
    }
    try {
      await handleApiCall(`${API_CALL_PREFIX}/backend/goals/create`, "POST", payload);
      await refreshGoals();
      setSuccessMessage("Habit created successfully!");
      setFormData(initialFormData); // Clear form
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Error is set by handleApiCall
      console.log(err)
    }
  };

  const updateGoal = async (e) => {
    e.preventDefault();
    if (!updateMe || !updateMe._id) {
        setError("No goal selected for update.");
        return;
    }
    const payload = {
      goalId: updateMe._id,
      description: formData.description || updateMe.description,
      days: parseInt(formData.days) || updateMe.days,
      duration: {
        hours: parseInt(formData.duration.hours) || 0, // Default to 0 if empty string from input
        minutes: parseInt(formData.duration.minutes) || 0,
      }
    };
     // Ensure hours and minutes are not NaN if updateMe.duration is missing (should not happen with schema)
    payload.duration.hours = isNaN(payload.duration.hours) ? (updateMe.duration?.hours || 0) : payload.duration.hours;
    payload.duration.minutes = isNaN(payload.duration.minutes) ? (updateMe.duration?.minutes || 0) : payload.duration.minutes;

    if (!payload.description || payload.days <= 0) {
        setError("Description and a valid number of days are required.");
        return;
    }

    try {
      await handleApiCall(`${API_CALL_PREFIX}/backend/goals/update`, "POST", payload); // Assuming your backend uses POST for update
      await refreshGoals();
      setSuccessMessage("Habit updated successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
      // Switch back to add mode
      setShowForm(false); // Or true, depending on desired UX
      setShowGoals(true);
      setAddingGoal(true);
      setUpdatingGoal(false);
      setUpdateMe(null);
      setFormData(initialFormData);
    } catch (err) {
      // Error is set by handleApiCall
      console.log(err);
    }
  };
  
  const handleDelete = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) return;
    try {
      await handleApiCall(`${API_CALL_PREFIX}/backend/goals/delete`, "POST", { goalId });
      setGoals(prevGoals => {
        const updatedGoals = prevGoals.filter(goal => goal._id !== goalId);
        if (updatedGoals.length === 0 && !actionLoading) { // Avoid state change if another action is loading
          setShowForm(true);
          setShowGoals(false);
          setAddingGoal(true);
          setUpdatingGoal(false);
          setUpdateMe(null);
        }
        return updatedGoals;
      });
      setSuccessMessage("Habit deleted successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Error is set by handleApiCall
      console.log(err);
    }
  };

  // Button to toggle form and goals visibility
  const toggleDisplay = () => {
    setShowForm(!showForm);
    setShowGoals(!showGoals);
    if (showGoals) { // If we are about to show the form (and hide goals)
      setAddingGoal(true);
      setUpdatingGoal(false);
      setUpdateMe(null);
      setFormData(initialFormData); // Reset form for adding
    }
    setSuccessMessage('');
    setError(null);
  };

  // UI for "Update" button on a goal card
  const handleEnterUpdateMode = (goal) => {
    setShowForm(true); 
    setShowGoals(false);
    setAddingGoal(false);
    setUpdatingGoal(true);
    setUpdateMe(goal);
    // Form data will be set by the useEffect watching [updatingGoal, updateMe]
    setError(null);
    setSuccessMessage('');
  };

  // UI for "Cancel" button in update form
  const handleCancelUpdate = () => {
    setAddingGoal(true);
    setUpdatingGoal(false);
    setUpdateMe(null);
    setFormData(initialFormData);
    setShowForm(true); // Or false if you want to go back to goals list
    setShowGoals(false); // Or true
    setError(null);
  };
  
  return (
    <div className='flex min-h-screen bg-bg text-text-primary font-serif'>
      <SideBar/>
      <div className='flex-1 p-4 md:p-8 overflow-y-auto'>
        {/* Global Loading and Error Display */}
        {loading && <p className='text-center text-xl py-10 text-text-muted'>Loading habits...</p>}
        
        {!loading && error && (
          <div className='bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6 text-center shadow-sm'>
            <p>Error: {error}</p>
            <button onClick={() => setError(null)} className="ml-2 underline text-sm hover:text-red-800">Dismiss</button>
          </div>
        )}
        {successMessage && (
            <p className='bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg mb-6 text-center shadow-sm'>{successMessage}</p>
        )}

        {!loading && (
          <div className="max-w-3xl mx-auto">
            {/* Titles */}
            {showForm && addingGoal && <h1 className='text-center my-6 text-3xl font-semibold text-primary'>Add New Habit</h1>}
            {showForm && updatingGoal && <h1 className='text-center my-6 text-3xl font-semibold text-primary'>Edit Habit</h1>}

            {/* Form Area */}
            {showForm && (
              <form 
                className='flex flex-col p-6 items-center justify-center gap-5 border border-secondary m-2 rounded-xl bg-bg shadow-md' 
                onSubmit={addingGoal ? handleSubmit : updateGoal}
              >
                <textarea 
                  rows="3" 
                  placeholder={addingGoal ? 'Enter Habit Description (e.g., Read for 30 minutes)' : (updateMe?.description || '')} 
                  name='description' 
                  id='description' 
                  onChange={handleChange} 
                  value={formData.description} 
                  className="w-full p-3 bg-bg border border-secondary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm"
                  required
                />
                <div className='w-full'>
                  <input 
                    placeholder={addingGoal ? 'Target Days (e.g., 30)' : (updateMe?.days?.toString() || '')}  
                    type='text' 
                    name='days' 
                    value={formData.days} 
                    onChange={handleChange} 
                    className='w-full p-3 bg-bg border border-secondary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm text-center'
                    pattern="\d*" 
                    required
                  />
                </div>
                <div className='flex flex-col sm:flex-row gap-4 w-full md:w-3/4'>
                  <input 
                    placeholder={addingGoal ? 'Hours / day (optional)' : (updateMe?.duration?.hours?.toString() ?? '0')} 
                    type='text' 
                    name='hours' 
                    value={formData.duration.hours} 
                    onChange={handleChange} 
                    className='p-3 bg-bg border border-secondary rounded-lg w-full text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm text-center'
                    pattern="\d*"
                  />
                  <input 
                    placeholder={addingGoal ? 'Minutes / day (optional)' : (updateMe?.duration?.minutes?.toString() ?? '0')} 
                    type='text' 
                    name='minutes' 
                    value={formData.duration.minutes} 
                    onChange={handleChange} 
                    className='p-3 bg-bg border border-secondary rounded-lg w-full text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm text-center'
                    pattern="\d*"
                  />
                </div>
                <button 
                  type="submit"
                  className='bg-primary hover:bg-accent text-bg rounded-lg p-3 w-48 transition-colors disabled:opacity-50 shadow-md'
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : (addingGoal ? 'Create Habit' : 'Update Habit')}
                </button>
                
                {updatingGoal && (
                  <button 
                    type="button"
                    className='bg-secondary hover:bg-opacity-80 text-bg rounded-lg p-3 w-48 transition-colors mt-2 shadow-md'
                    onClick={handleCancelUpdate}
                    disabled={actionLoading}
                  >
                    Cancel Update
                  </button>
                )}
              </form>
            )}
            
            {/* Toggle Button Area */}
            {(!showForm || (showForm && addingGoal)) && goals.length > 0 && (
              <div className={`flex ${showForm ? "justify-center" : "justify-end"} mt-6 mb-4`}>
                <button 
                  className={`p-3 w-auto min-w-[180px] rounded-lg text-bg transition-colors shadow-md ${showGoals ? "bg-red-500 hover:bg-red-600" : "bg-secondary hover:bg-opacity-80"}`} 
                  onClick={toggleDisplay}
                  disabled={actionLoading}
                >
                  {showGoals ? "Hide Habits List" : "Show Habits List"}
                </button>
              </div>
            )}
            {goals.length === 0 && !showForm && !loading && (
                <p className='text-center text-text-muted mt-10'>You have no habits yet. Click the button above to add one.</p>
            )}
             {goals.length === 0 && showForm && !loading && (
                <p className='text-center text-text-muted mt-10'>No habits to display. Add one using the form above!</p>
            )}


            {/* Goals List Area */}
            {showGoals && (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
                {goals.length > 0 ? goals.map((goal) => (
                  <div key={goal._id}
                    className='bg-bg border border-secondary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 flex flex-col justify-between'
                  >
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-3 break-words">{goal.description}</h3>
                        <div className='flex justify-between items-center gap-2 text-sm mb-1.5 text-text-muted'>
                          <p className='font-medium'>Target Days: <span className='font-semibold text-text-primary'>{goal.days}</span></p>
                          <p className='font-medium'>Completed: <span className='font-semibold text-text-primary'>{goal.count || 0}</span></p>
                        </div>
                        <div className='flex justify-between items-center gap-2 text-sm text-text-muted'>
                          <p className='font-medium'>Hours: <span className='font-semibold text-text-primary'>{goal.duration.hours || 0}</span></p>
                          <p className='font-medium'>Minutes: <span className='font-semibold text-text-primary'>{goal.duration.minutes || 0}</span></p>
                        </div>
                      </div>
                      <div className='flex flex-col justify-evenly gap-3 items-center mt-5 pt-4 border-t border-secondary/50'>
                        <button 
                          className='bg-accent hover:opacity-90 border border-transparent text-bg rounded-lg w-full py-2 transition-colors disabled:opacity-50 shadow-sm' 
                          onClick={() => handleEnterUpdateMode(goal)}
                          disabled={actionLoading}
                        >
                          Update
                        </button>
                        <button 
                          className='bg-red-600 hover:bg-red-700 border border-transparent text-white rounded-lg w-full py-2 transition-colors disabled:opacity-50 shadow-sm' 
                          onClick={()=> handleDelete(goal._id)}
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                      </div>
                  </div>
                )) : (
                  <p className='col-span-full text-center text-text-muted py-8'>No habits to display. Add one using the form!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
