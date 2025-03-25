import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const [formData, setFormData] = useState({
    content: "",
  })
  const currentUser = useSelector(state=> state.user);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showHabitsOptions, setShowHabitsOptions] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  
  const handleChange = (e)=>{
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }
  const createDaPost = async(e)=>{
    e.preventDefault();
    setLoading(true);
    try {
      console.log('second');
      console.log(formData.content);
      const res = await fetch("/backend/posts/create",{
        method : "POST",
            headers:{
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(formData),
      })
      console.log(res);
      console.log('third');
      const data = await res.json();
      if(!res.ok){
        console.log('fourth');
        setLoading(false);
        setError(data.message);
        return;
      }
      console.log('fifth');
      setError(null);
      setLoading(false);
    } catch (error) {
      console.log('sixth');
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
      <div className='border border-red-800 flex-1 h-full pt-0 pb-0 p-4'>
        <p className='text-center mt-2 text-3xl font-bold italic'>Create Post</p>
        <form className='flex flex-col p-8 items-center justify-center gap-4 border m-2 rounded-2xl' onSubmit={createDaPost}>
            <textarea rows="5" placeholder="What's on your mind" name='content' id='content' onChange={handleChange} value={formData.content} className="w-full p-2 mt-1 text-black border rounded-2xl text-center"/>
            <button className='border bg-green-700 w-40 rounded-2xl'>Create</button>
          </form>
      </div>
    </div>
  )
}
      