import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signInFailure, signInStart, signInSuccess, signOutFailure } from '../../redux/user/userSlice';
import { API_CALL_PREFIX } from '../../config.js';
export default function Signin() {

  const {error, loading} = useSelector(state => state.user);
  const [formData, setFormData] = useState({});
  const dispacth = useDispatch();
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
   const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleChange = (e)=>{
    setFormData({
        ...formData,
        [e.target.id] : e.target.value,
    });
  };

  const handleSubmit = async(e)=>{
    //   setError(null);
      try {
        e.preventDefault();
        // setLoading(true);
        dispacth(signInStart());
        const res = await fetch(`${API_CALL_PREFIX}/backend/auth/signin`,{
            method : "POST",
            headers : {
                'Content-Type' : 'application/json',
            },
            
            body : JSON.stringify(formData),
        });
        const data = await res.json();

        if(res.ok === false){
            // setError(data.message);
            // setLoading(false);
            dispacth(signInFailure(data.message));
            return;
        }
        // setError(null);
        // setLoading(false);
        dispacth(signInSuccess(data));
        navigate("/home", {state: {formData}});
    } catch (error) {
        // setError(error.message);
        // setLoading(false);
        dispacth(signOutFailure(error.message));
    }
  }

  return <div className='bg-bg flex items-center justify-center min-h-screen px-4 py-8 font-serif'>
    <div className='bg-bg text-text-primary p-8 rounded-xl shadow-md w-full max-w-md border border-secondary'>
        <h1 className='text-3xl font-bold text-center mb-8 text-primary'>Log In</h1>
        <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
            <input 
                placeholder='Email ID' 
                id='email' 
                type='email' required
                className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' 
                onChange={handleChange}/>
            <input 
                placeholder='Password' 
                id='password' 
                type='password' required
                className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' 
                onChange={handleChange}/>

            {error && <p className='text-red-700 text-center text-sm'>{error}</p>}

            <button disabled = {loading} className={`p-3 rounded-lg text-bg bg-primary hover:bg-accent transition disabled:opacity-50 shadow-md ${loading && "cursor-not-allowed"}`}>
                {loading ? "Loading..." : "LOG IN"}
            </button>
        </form>
        <div className='flex justify-center gap-2 mt-6'>
            <p className='text-text-muted'>Dont have an account?</p>
            <Link to={'/signup'} className='text-secondary hover:underline hover:text-accent'>Sign Up</Link>
        </div>
    </div>
  </div>
}