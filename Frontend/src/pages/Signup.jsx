import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_CALL_PREFIX } from '../../config.js';
export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const eemail = location.state?.email;
  let email = null;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
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
        email = eemail || formData.email;
        
        // Create FormData object to handle file upload
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', email);
        formDataToSend.append('age', formData.age);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('password', formData.password);
        
        if (profilePicture) {
            formDataToSend.append('profilePicture', profilePicture);
        }
        
        const res = await fetch(`${API_CALL_PREFIX}/backend/auth/signup`, {
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
        navigate("/verify", {state: {email, formData}});
    }
    catch(error){
        setError(error.message);
        setLoading(false);
    }
  }
  
  return <div className='bg-bg flex items-center justify-center min-h-screen px-4 py-8 font-serif'>
    <div className='bg-bg text-text-primary p-8 rounded-xl shadow-md w-full max-w-md border border-secondary'>
        <h1 className='text-3xl font-bold text-center mb-8 text-primary'>Sign Up</h1>
        <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
            {/* Profile picture upload */}
            <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-secondary shadow-sm">
                    <img 
                        src={previewUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <label className="cursor-pointer text-secondary hover:text-accent">
                    <span>Choose Profile Picture</span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </label>
            </div>
            
            <input 
                placeholder='Username' 
                id='username' 
                type='text' required
                className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' 
                onChange={handleChange}/>
            <input 
                placeholder='Email' 
                value={eemail} 
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
            <input 
                placeholder='Age' 
                id='age' 
                type='text'
                min='14' max='100' required
                className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' 
                onChange={handleChange}/>
            <select 
                id='gender'
                name='gender'
                type='text'
                required
                className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm'
                onChange={handleChange}
            >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>

            {error && (
                <p className='text-red-700 text-center text-sm'>
                {typeof error === 'string' ? error : "Error occurred"}
                </p>
            )}

            <button disabled={loading} className={`p-3 rounded-lg text-bg bg-primary hover:bg-accent transition disabled:opacity-50 shadow-md ${loading && "cursor-not-allowed"}`}>
                {loading ? "Loading..." : "SIGN UP"}
            </button>
        </form>
        <div className='flex justify-center gap-2 mt-6'>
            <p className='text-text-muted'>Have an account?</p>
            <Link to={'/signin'} className='text-secondary hover:underline hover:text-accent'>Log In</Link>
        </div>
    </div>
  </div>
}
