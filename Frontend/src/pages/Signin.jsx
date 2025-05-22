import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signInFailure, signInStart, signInSuccess, signOutFailure } from '../../redux/user/userSlice';

export default function Signin() {

  const {error, loading} = useSelector(state => state.user);
  const [formData, setFormData] = useState({});
  const dispacth = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e)=>{
    setFormData({
        ...formData,
        [e.target.id] : e.target.value,
    });
  };

  const handleSubmit = async(e)=>{
      try {
        e.preventDefault();
        dispacth(signInStart());
        const res = await fetch("/backend/auth/signin",{
            method : "POST",
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify(formData),
        });
        const data = await res.json();

        if(res.ok === false){
            dispacth(signInFailure(data.message));
            return;
        }
        dispacth(signInSuccess(data));
        navigate("/home", {state: {formData}});
    } catch (error) {
        dispacth(signOutFailure(error.message));
    }
  }

  return (
    <div className='bg-black flex items-center justify-center min-h-screen px-4 mx-auto'>
      <div className='w-full max-w-md'>
        <h1 className='text-4xl font-light text-white mb-12 tracking-widest text-center'>SIGN IN</h1>
        
        <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
          <div className="relative">
            <input 
              placeholder=' ' 
              id='email' 
              type='email' 
              required
              className='w-full bg-transparent border-b border-white/30 p-2 text-white focus:outline-none focus:border-white peer transition-colors duration-300 text-sm' 
              onChange={handleChange}
            />
            <label 
              htmlFor='email'
              className='absolute left-0 -top-5 text-white/50 text-xs tracking-wider uppercase font-light transition-all duration-300'
            >
              Email
            </label>
          </div>
          
          <div className="relative">
            <input 
              placeholder=' ' 
              id='password' 
              type='password' 
              required
              className='w-full bg-transparent border-b border-white/30 p-2 text-white focus:outline-none focus:border-white peer transition-colors duration-300 text-sm' 
              onChange={handleChange}
            />
            <label 
              htmlFor='password'
              className='absolute left-0 -top-5 text-white/50 text-xs tracking-wider uppercase font-light transition-all duration-300'
            >
              Password
            </label>
          </div>

          {error && (
            <p className='text-red-400 text-xs tracking-wide mt-2'>{error}</p>
          )}

          <button 
            disabled={loading} 
            className='mt-8 py-3 rounded-sm text-black bg-white hover:bg-gray-200 transition-colors duration-300 text-xs tracking-widest font-light uppercase disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
        
        <div className='flex justify-center mt-6'>
          <p className='text-white/50 text-xs tracking-wider'>
            DON&apos;T HAVE AN ACCOUNT? 
            <Link to='/signup' className='text-white ml-2 hover:underline transition-all duration-300'>
              SIGN UP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}