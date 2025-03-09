import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import { signInFailure, signOutFailure, signOutStart, signOutSuccess } from '../../redux/user/userSlice';

export default function Profile() {

  const currentUser = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

  const handleSignOut = async()=>{
    try {
      dispatch(signOutStart());
      const res = await fetch("/backend/auth/signout");
      const data = await res.json();
      if(res.ok === false){
        dispatch(signOutFailure(data.message));
        return;
      }
      dispatch(signOutSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  }
  
  const handleChange = ()=>{

  }
  const handleSubmit = async(e)=>{

  }

  return <div className='bg-gray-900 flex items-center justify-center min-h-screen bg-cover bg-center px-4'>
  <div className='bg-gray-900 text-white p-8 rounded-xl shadow-lg w-full max-w-md border border-white'>
      <h1 className='text-3xl font-bold text-center mb-6 text-green-500'>Sign In</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <input 
              placeholder='Username' 
              id='username' 
              type='text' required
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
              onChange={handleChange}/>
          <input 
              placeholder='Email' 
              // value={eemail} 
              id='email' 
              type='email' required
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
              onChange={handleChange}/>
          <input 
              placeholder='Password' 
              id='password' 
              type='password' required
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
              onChange={handleChange}/>
          <input 
              placeholder='Age' 
              id='age' 
              type='text'
              min='14' max='100' required
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
              onChange={handleChange}/>
          <select 
              id='gender'
              name='gender'
              type='text'
              required
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500'
              onChange={handleChange}
          >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Mentally Challenged</option>
          </select>

          {error && <p className='text-red-700 text-center'>{error}</p>}

          <button disabled = {loading} className={`p-3 rounded-lg text-white bg-green-600 transition disabled:opacity-50 ${loading && "cursor-not-allowed"}`}>
              {loading ? "Loading..." : "Update Profile"}
          </button>
      </form>
  </div>
</div>
}