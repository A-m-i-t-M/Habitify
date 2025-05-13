import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { signInFailure, signOutFailure, signOutStart, signOutSuccess } from '../../redux/user/userSlice';

export default function Profile() {

  const currentUser = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [newEmail, setNewEmail] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
      const timers = JSON.parse(localStorage.getItem('timers')) || [];
      const pausedTimers = timers.map((timer) => ({
        ...timer,
        isRunning: false,
        lastUpdated: new Date().toISOString().split('T')[0], // store the date
      }));

      localStorage.setItem('timers', JSON.stringify(pausedTimers));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  }
  
  const handleChange = (e)=>{
    // setFormData({
    //   ...formData,
    //   [e.target.id] : e.target.value,
    // })
    const {id, value} = e.target;
    if(id === "email" && value !== currentUser?.email){
      setNewEmail(true);
    }
    setFormData((prevData)=>({
      ...prevData,
      [id] : value,
    }))
  }
  const handleSubmit = async(e)=>{
    setError(null);
    setLoading(true);
    e.preventDefault();
    try {
      const res = await fetch("/backend/auth/update",{
        method : "POST",
        headers:{
          'Content-Type' : 'application/json',
        },
        body : JSON.stringify(formData),
      });

      const data = res.json();
      setLoading(false);
      if(newEmail){
        navigate("/verify", {state : {email : formData.email}});
      }
      console.log(data);      
      setUpdateSuccess(true);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  console.log(currentUser);
  
  return <div className='bg-gray-900 flex items-center justify-center min-h-screen bg-cover bg-center px-4'>
  <div className='bg-gray-900 text-white p-8 rounded-xl shadow-lg w-full max-w-md border border-white mt-0'>
      <h1 className='text-3xl font-bold text-center mb-6 text-green-500'> Update Profile </h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <input 
              placeholder= "Username" 
              id='username' 
              type='text' 
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
              onChange={handleChange}/>
          <input 
              placeholder='Email' 
              id='email' 
              type='email' 
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
              onChange={handleChange}/>
          <input 
              placeholder='Password' 
              id='password' 
              type='password' 
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
              onChange={handleChange}/>
          <input 
              placeholder='Age' 
              id='age' 
              type='text'
              min='14' max='100' 
              className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
              onChange={handleChange}/>
          <select 
              id='gender'
              name='gender'
              type='text'
              
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
      <div className='mt-4 flex justify-between'>
        <span className='text-red-700 font-medium cursor-pointer'
              // onClick={handleDeleteUser}
              >
          Delete Account
        </span>
        <span className='text-red-700 font-medium cursor-pointer'
              onClick={handleSignOut}
              >
          Sign Out
        </span>
      </div>
      <p className='text-red-700 font-medium mt-4'>{error ? error : ''}</p>
      <p className='text-green-700 font-medium mt-4'>{updateSuccess ? 'Profile Updated Sucessfully' : ''}</p>
  </div>
</div>
}