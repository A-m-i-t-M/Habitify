import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { signInFailure, signOutFailure, signOutStart, signOutSuccess, updateUserStart, updateUserSuccess, updateUserFailure } from '../../redux/user/userSlice';
import { API_CALL_PREFIX } from '../../config.js';
export default function Profile() {

  const { currentUser, loading, error } = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newEmail, setNewEmail] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const token = localStorage.getItem("token");
  // Initialize form data and preview URL when component mounts or currentUser changes
  console.log(error)
  console.log("localeror",localError);
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        age: currentUser.age || '',
        gender: currentUser.gender || '',
      });
      setPreviewUrl(currentUser.avatar);
    }
  }, [currentUser]);

  const handleSignOut = async()=>{
    try {
      dispatch(signOutStart());
      const res = await fetch(`${API_CALL_PREFIX}/backend/auth/signout`);
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
    const {id, value} = e.target;
    if(id === "email" && value !== currentUser?.email){
      setNewEmail(true);
    }
    setFormData((prevData)=>({
      ...prevData,
      [id] : value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setLocalError('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setLocalError('File size must be less than 5MB');
        return;
      }

      setProfilePicture(file);
      setLocalError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async(e)=>{
    setLocalError(null);
    setLocalLoading(true);
    e.preventDefault();
    
    try {
      dispatch(updateUserStart());
      
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Only append fields that have changed
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key] !== currentUser[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }
      
      // Check if there are any changes to update
      let hasChanges = false;
      for (let pair of formDataToSend.entries()) {
        hasChanges = true;
        break;
      }
      
      if (!hasChanges) {
        setLocalError('No changes to update');
        setLocalLoading(false);
        dispatch(updateUserFailure('No changes to update'));
        return;
      }

      const res = await fetch(`${API_CALL_PREFIX}/backend/auth/update`,{
        method : "POST", 
        headers: {
   
    'Authorization': `Bearer ${token}`
  },// Changed from POST to PUT as per your backend
        body : formDataToSend, // Don't set Content-Type header when sending FormData
        credentials: 'include' // Include cookies for authentication
      });

      const data = await res.json();
      setLocalLoading(false);
      
      if (!res.ok || data.success === false) {
        dispatch(updateUserFailure(data.message || data.error || 'Update failed'));
        setLocalError(data.message || data.error || 'Update failed');
        return;
      }
      
      dispatch(updateUserSuccess(data.user));
      setUpdateSuccess(true);
      setProfilePicture(null); // Reset file input
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      if(newEmail){
        navigate("/verify", {state : {email : formData.email}});
      }
      
    } catch (error) {
      setLocalError(error.message);
      setLocalLoading(false);
      dispatch(updateUserFailure(error.message));
    }
  }

  // Separate function to handle profile picture only update
  const handleProfilePictureUpdate = async () => {
    if (!profilePicture) return;
    
    try {
      setLocalLoading(true);
      dispatch(updateUserStart());
      
      const formDataToSend = new FormData();
      formDataToSend.append('profilePicture', profilePicture);
      
      const res = await fetch(`${API_CALL_PREFIX}/backend/auth/update-profile-picture`, {
        method: 'POST',
        headers: {
  
    'Authorization': `Bearer ${token}`
  }, 
        body: formDataToSend,
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        dispatch(updateUserFailure(data.message || data.error));
        setLocalError(data.message || data.error);
        setLocalLoading(false);
        return;
      }
      
      dispatch(updateUserSuccess(data.user));
      setUpdateSuccess(true);
      setProfilePicture(null);
      setLocalLoading(false);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setLocalError(error.message);
      setLocalLoading(false);
    }
  };

  console.log(currentUser);
  
  return <div className='bg-bg flex items-center justify-center min-h-screen px-4 py-8 font-serif'>
  <div className='bg-bg text-text-primary p-8 rounded-xl shadow-md w-full max-w-md border border-secondary mt-0'>
      <h1 className='text-3xl font-bold text-center mb-8 text-primary'> Update Profile </h1>
      
      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-secondary shadow-sm">
          <img 
            src={previewUrl || currentUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <label className="cursor-pointer text-secondary hover:text-accent mb-2">
          <span>Change Profile Picture</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </label>
        {profilePicture && (
          <button 
            onClick={handleProfilePictureUpdate}
            className="bg-primary text-bg px-4 py-1.5 rounded-lg text-sm hover:bg-accent transition disabled:opacity-50 shadow-sm"
            disabled={localLoading || loading}
          >
            {(localLoading || loading) ? 'Updating...' : 'Update Picture Only'}
          </button>
        )}
      </div>

      <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
          <input 
              placeholder= "Username" 
              id='username' 
              type='text' 
              value={formData.username || ''}
              className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' 
              onChange={handleChange}/>
          <input 
              placeholder='Email' 
              id='email' 
              type='email' 
              value={formData.email || ''}
              className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' 
              onChange={handleChange}/>
          <input 
              placeholder='Password (leave blank to keep current)' 
              id='password' 
              type='password' 
              className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' 
              onChange={handleChange}/>
          <input 
              placeholder='Age' 
              id='age' 
              type='text'
              value={formData.age || ''}
              min='14' max='100' 
              className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm' 
              onChange={handleChange}/>
          <select 
              id='gender'
              name='gender'
              type='text'
              value={formData.gender || ''}
              className='border border-secondary p-3 rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm'
              onChange={handleChange}
          >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
          </select>

          {(localError || error) && <p className='text-red-600 text-center text-sm'>{localError || error}</p>}

          <button disabled = {localLoading || loading} className={`p-3 rounded-lg text-bg bg-primary hover:bg-accent transition disabled:opacity-50 shadow-md ${(localLoading || loading) && "cursor-not-allowed"}`}>
              {(localLoading || loading) ? "Loading..." : "Update Profile"}
          </button>

      </form>
      <div className='mt-6 flex justify-between'>
        <span className='text-red-600 font-medium cursor-pointer hover:underline'
              // onClick={handleDeleteUser}
              >
          
        </span>
        <span className='text-red-600 font-medium cursor-pointer hover:underline'
              onClick={handleSignOut}
              >
          Sign Out
        </span>
      </div>
      { (localError || error) && <p className='text-red-600 font-medium mt-4 text-center text-sm'>{localError || error}</p>}
      { updateSuccess && <p className='text-green-600 font-medium mt-4 text-center text-sm'>Profile Updated Successfully</p>}
  </div>
</div>
}
