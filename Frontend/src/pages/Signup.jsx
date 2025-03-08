import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  
  let email = location.state?.email;
  let sending_email = null;
  const [formData, setFormData] = useState({
    username : '',
    email : '',
    age : '',
    gender : '',
    password : '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log(formData);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    try{
        setLoading(true);
        console.log("sjldkfjlkdsajlkfjdslk1")
        const res = await fetch("http://localhost:3000/backend/auth/signup",{
            method: "POST",
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if(data.success === false){
            setError(true);
            setLoading(false);
            return;
        }
        setError(null);
        setLoading(false);
        sending_email = email || formData.email;
        console.log(sending_email);
        navigate("/verify", {state: {sending_email, formData}});
    }
    catch(error){
        setError(error.message);
        setLoading(false);
    }
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
                value={email} 
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
                {loading ? "Loading..." : "SIGN UP"}
            </button>
        </form>
        <div className='flex justify-center gap-2 mt-4'>
            <p className='text-white'>Have an account?</p>
            <Link to={'/signin'} className='text-green-600 hover:underline'>Log In</Link>
        </div>
    </div>
  </div>
}
