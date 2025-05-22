import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromLanding = location.state?.email || '';
  
  const [formData, setFormData] = useState({
    username: '',
    email: emailFromLanding,
    age: '',
    gender: '',
    password: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
        setLoading(true);
        
        // Create FormData object to handle file upload
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('age', formData.age);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('password', formData.password);
        
        if (profilePicture) {
            formDataToSend.append('profilePicture', profilePicture);
        }
        
        const res = await fetch("http://localhost:3000/backend/auth/signup", {
            method: "POST",
            body: formDataToSend, // Don't set Content-Type header when sending FormData
        });
        
        const data = await res.json();
        if(data.success === false){
            setError(data.message || true);
            setLoading(false);
            return;
        }
        setError(null);
        setLoading(false);
        navigate("/verify", {state: {email: formData.email, formData}});
    }
    catch(error){
        setError(error.message);
        setLoading(false);
    }
  }
  
  return (
    <div className='bg-black flex items-center justify-center min-h-screen px-4'>
      <div className='w-full max-w-md'>
        <h1 className='text-4xl font-light text-white mb-12 tracking-widest text-center uppercase'>Sign Up</h1>
        
        <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
          {/* Profile picture upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border border-white/30 bg-black">
              <img 
                src={previewUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
                alt="Profile Preview" 
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <label className="cursor-pointer text-white/70 text-xs tracking-wider uppercase hover:text-white transition-colors duration-300">
              <span>Choose Profile Picture</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          <div className="relative">
            <input 
              placeholder=' ' 
              id='username' 
              type='text'
              required
              className='w-full bg-transparent border-b border-white/30 p-2 text-white focus:outline-none focus:border-white peer transition-colors duration-300 text-sm' 
              onChange={handleChange}
            />
            <label 
              htmlFor='username'
              className='absolute left-0 -top-5 text-white/50 text-xs tracking-wider uppercase font-light transition-all duration-300'
            >
              Username
            </label>
          </div>
          
          <div className="relative">
            <input 
              placeholder=' '
              value={formData.email}
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
          
          <div className="relative">
            <input 
              placeholder=' '
              id='age' 
              type='text'
              min='14' 
              max='100' 
              required
              className='w-full bg-transparent border-b border-white/30 p-2 text-white focus:outline-none focus:border-white peer transition-colors duration-300 text-sm' 
              onChange={handleChange}
            />
            <label 
              htmlFor='age'
              className='absolute left-0 -top-5 text-white/50 text-xs tracking-wider uppercase font-light transition-all duration-300'
            >
              Age
            </label>
          </div>
          
          <div className="relative">
            <select 
              id='gender'
              name='gender'
              required
              className='w-full bg-transparent border-b border-white/30 p-2 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm appearance-none'
              onChange={handleChange}
            >
              <option value="" className="bg-black">Select Gender</option>
              <option value="Male" className="bg-black">Male</option>
              <option value="Female" className="bg-black">Female</option>
              <option value="Other" className="bg-black">Other</option>
            </select>
            <label 
              htmlFor='gender'
              className='absolute left-0 -top-5 text-white/50 text-xs tracking-wider uppercase font-light transition-all duration-300'
            >
              Gender
            </label>
            <div className="absolute right-2 top-3 pointer-events-none">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {error && (
            <p className='text-red-400 text-xs tracking-wide mt-2'>
              {typeof error === 'string' ? error : "Error occurred"}
            </p>
          )}

          <button 
            disabled={loading} 
            className='mt-8 py-3 rounded-sm text-black bg-white hover:bg-gray-200 transition-colors duration-300 text-xs tracking-widest font-light uppercase disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? "SIGNING UP..." : "SIGN UP"}
          </button>
        </form>
        
        <div className='flex justify-center mt-6'>
          <p className='text-white/50 text-xs tracking-wider'>
            HAVE AN ACCOUNT? 
            <Link to='/signin' className='text-white ml-2 hover:underline transition-all duration-300'>
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
