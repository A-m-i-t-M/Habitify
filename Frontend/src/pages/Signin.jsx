import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

export default function Signin() {

  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e)=>{
    setFormData({
        ...formData,
        [e.target.id] : [e.target.value],
    });
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    setError(null);
    try {
        setLoading(true);
        const res = await fetch("/backend/auth/signin",{
            method : "POST",
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify(formData),
        });
        const data = await res.json();

        if(res.ok === false){
            setError(data.message);
            setLoading(false);
            return;
        }
        setError(null);
        setLoading(false);
        navigate("/home");
    } catch (error) {
        setError(error.message);
        setLoading(false);
    }
  }

  return <div className='bg-gray-900 flex items-center justify-center min-h-screen bg-cover bg-center px-4'>
    <div className='bg-gray-900 text-white p-8 rounded-xl shadow-lg w-full max-w-md border border-white'>
        <h1 className='text-3xl font-bold text-center mb-6 text-green-500'>Log In</h1>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <input 
                placeholder='Username' 
                id='username' 
                type='text' required
                className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
                onChange={handleChange}/>
            <input 
                placeholder='Password' 
                id='password' 
                type='password' required
                className='border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500' 
                onChange={handleChange}/>
            
            {error && <p className='text-red-700 text-center'>{error}</p>}

            <button disabled = {loading} className={`p-3 rounded-lg text-white bg-green-600 transition disabled:opacity-50 ${loading && "cursor-not-allowed"}`}>
                {loading ? "Loading..." : "LOG IN"}
            </button>
        </form>
        <div className='flex justify-center gap-2 mt-4'>
            <p className='text-white'>Don't have an account?</p>
            <Link to={'/signup'} className='text-green-600 hover:underline'>Sign Up</Link>
        </div>
    </div>
  </div>
}
