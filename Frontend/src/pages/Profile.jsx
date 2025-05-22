import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { signInFailure, signOutFailure, signOutStart, signOutSuccess, updateUserStart, updateUserSuccess, updateUserFailure } from '../../redux/user/userSlice';
import SideBar from '../../components/SideBar';
import { motion } from 'framer-motion';
import PinInput from 'react-pin-input';

export default function Profile() {
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newEmail, setNewEmail] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteOtpModal, setShowDeleteOtpModal] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteTimer, setDeleteTimer] = useState(30);
  const [deleteResendDisabled, setDeleteResendDisabled] = useState(true);
  const [deleteError, setDeleteError] = useState(null);

  // Initialize form data and preview URL when component mounts or currentUser changes
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

  // Timer for OTP resend
  useEffect(() => {
    if (timer > 0 && showOtpModal) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
  }, [timer, showOtpModal]);

  // Timer for delete account OTP resend
  useEffect(() => {
    if (deleteTimer > 0 && showDeleteOtpModal) {
      const interval = setInterval(() => {
        setDeleteTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (deleteTimer === 0) {
      setDeleteResendDisabled(false);
    }
  }, [deleteTimer, showDeleteOtpModal]);

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
    const {id, value} = e.target;
    if(id === "email" && value !== currentUser?.email){
      setNewEmail(true);
    }
    setFormData((prevData)=>({
      ...prevData,
      [id] : value,
    }))
  }

  const handlePasswordChange = (e) => {
    const {id, value} = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [id]: value
    }));
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
        if (key !== 'emailNotifications' && formData[key] && formData[key] !== currentUser[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }
      
      // Check if there are any changes to update
      const hasChanges = formDataToSend.entries().next().done === false;
      
      if (hasChanges) {
        const res = await fetch("/backend/auth/update",{
          method : "PUT",
          body : formDataToSend,
          credentials: 'include'
        });

        const data = await res.json();
        
        if (!res.ok || data.success === false) {
          dispatch(updateUserFailure(data.message || data.error || 'Update failed'));
          setLocalError(data.message || data.error || 'Update failed');
          setLocalLoading(false);
          return;
        }
        
        dispatch(updateUserSuccess(data.user));
      }
      
      // Check if email notifications setting changed
      if (formData.emailNotifications !== undefined && formData.emailNotifications !== currentUser.emailNotifications) {
        const notifRes = await fetch("/backend/auth/update-email-notifications", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enabled: formData.emailNotifications
          })
        });
        
        const notifData = await notifRes.json();
        
        if (!notifRes.ok) {
          dispatch(updateUserFailure(notifData.message || notifData.error || 'Failed to update email notifications'));
          setLocalError(notifData.message || notifData.error || 'Failed to update email notifications');
          setLocalLoading(false);
          return;
        }
        
        // Update the user state with new notification settings
        dispatch(updateUserSuccess({
          ...currentUser,
          emailNotifications: formData.emailNotifications
        }));
      }
      
      setUpdateSuccess(true);
      setProfilePicture(null); // Reset file input
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      if(newEmail){
        navigate("/verify", {state : {email : formData.email}});
      }
      
      setLocalLoading(false);
    } catch (error) {
      setLocalError(error.message);
      setLocalLoading(false);
      dispatch(updateUserFailure(error.message));
    }
  };

  // Start password change process
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    
    // Validate passwords
    if (passwordFormData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setLocalLoading(true);
    
    try {
      // Request OTP for password change
      const res = await fetch("/backend/auth/request-password-change-otp", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send OTP");
      }
      
      // Show OTP verification modal
      setShowPasswordModal(false);
      setShowOtpModal(true);
      setTimer(30);
      setIsResendDisabled(true);
      
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Resend OTP for password change
  const resendOTP = async () => {
    setPasswordError(null);
    setLocalLoading(true);
    setTimer(30);
    setIsResendDisabled(true);
    
    try {
      const res = await fetch("/backend/auth/request-password-change-otp", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to resend OTP");
      }
      
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Submit OTP and complete password change
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (otp.length < 6) {
      setPasswordError("OTP must be 6 digits");
      return;
    }
    
    setLocalLoading(true);
    
    try {
      const res = await fetch("/backend/auth/change-password", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordFormData.newPassword,
          otp
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to change password");
      }
      
      // Reset and close modals
      setOtp("");
      setShowOtpModal(false);
      setPasswordFormData({ newPassword: '', confirmPassword: '' });
      
      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Request OTP for account deletion
  const handleDeleteRequest = async () => {
    setDeleteError(null);
    setLocalLoading(true);
    
    try {
      const res = await fetch("/backend/auth/request-delete-account-otp", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send OTP");
      }
      
      // Show OTP verification modal
      setShowDeleteModal(false);
      setShowDeleteOtpModal(true);
      setDeleteTimer(30);
      setDeleteResendDisabled(true);
      
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Resend OTP for account deletion
  const handleDeleteResendOTP = async () => {
    setDeleteError(null);
    setLocalLoading(true);
    setDeleteTimer(30);
    setDeleteResendDisabled(true);
    
    try {
      const res = await fetch("/backend/auth/request-delete-account-otp", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to resend OTP");
      }
      
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Submit OTP and perform account deletion
  const handleDeleteOtpSubmit = async (e) => {
    e.preventDefault();
    setDeleteError(null);
    
    if (deleteOtp.length < 6) {
      setDeleteError("OTP must be 6 digits");
      return;
    }
    
    setLocalLoading(true);
    
    try {
      const res = await fetch("/backend/auth/delete-account", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: deleteOtp
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to delete account");
      }
      
      // Sign out the user after successful deletion
      dispatch(signOutSuccess());
      
      // Redirect to landing page with a message
      navigate("/", { state: { message: "Your account has been deleted successfully." } });
      
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <SideBar />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="text-2xl font-light tracking-widest uppercase mb-6">Profile</h1>
            
            <div className="flex gap-6 border-b border-white/10 mb-10">
              <button 
                className={`pb-4 px-1 text-xs uppercase tracking-wider font-light relative ${
                  activeSection === 'profile' ? 'text-white' : 'text-white/50'
                }`}
                onClick={() => setActiveSection('profile')}
              >
                Account
                {activeSection === 'profile' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                    layoutId="activeSection"
                  />
                )}
              </button>
              <button 
                className={`pb-4 px-1 text-xs uppercase tracking-wider font-light relative ${
                  activeSection === 'settings' ? 'text-white' : 'text-white/50'
                }`}
                onClick={() => setActiveSection('settings')}
              >
                Settings
                {activeSection === 'settings' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                    layoutId="activeSection"
                  />
                )}
              </button>
            </div>
            
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full overflow-hidden border border-white/20 mb-4">
                        <img 
                          src={previewUrl || currentUser?.avatar || "https://via.placeholder.com/150"} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full">
                        <span className="text-white/70 text-xs uppercase tracking-wider">Change</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-white text-sm font-light mt-2">{currentUser?.username}</p>
                    <p className="text-white/50 text-xs">{currentUser?.email}</p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="relative">
                      <label 
                        htmlFor="username"
                        className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block"
                      >
                        Username
                      </label>
                      <input 
                        type="text" 
                        id="username"
                        value={formData.username || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                      />
                    </div>
                    
                    <div className="relative">
                      <label 
                        htmlFor="email"
                        className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block"
                      >
                        Email
                      </label>
                      <input 
                        type="email" 
                        id="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label 
                          htmlFor="age"
                          className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block"
                        >
                          Age
                        </label>
                        <input 
                          type="number" 
                          id="age"
                          value={formData.age || ''}
                          onChange={handleChange}
                          className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                        />
                      </div>
                      
                      <div className="relative">
                        <label 
                          htmlFor="gender"
                          className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block"
                        >
                          Gender
                        </label>
                        <select 
                          id="gender"
                          value={formData.gender || ''}
                          onChange={handleChange}
                          className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm appearance-none"
                        >
                          <option value="" disabled className="bg-black">Select gender</option>
                          <option value="Male" className="bg-black">Male</option>
                          <option value="Female" className="bg-black">Female</option>
                          <option value="Other" className="bg-black">Other</option>
                        </select>
                        <div className="absolute right-3 top-[38px] pointer-events-none">
                          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {localError && (
                    <div className="text-red-400 text-xs tracking-wider">
                      {localError}
                    </div>
                  )}
                  
                  {updateSuccess && (
                    <div className="text-white/70 text-xs tracking-wider">
                      Profile updated successfully
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button 
                      type="submit" 
                      disabled={localLoading}
                      className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50 flex-1"
                    >
                      {localLoading ? 'Updating...' : 'Update Profile'}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleSignOut}
                      className="px-6 py-3 bg-transparent border border-white/30 text-white hover:border-white transition-colors duration-300 text-xs uppercase tracking-wider font-light flex-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {activeSection === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-lg font-light mb-4">Notifications</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm">Email Notifications</p>
                        <p className="text-xs text-white/50">Receive updates for new posts, messages, and friend requests</p>
                      </div>
                      <label className="w-10 h-5 bg-white/20 rounded-full relative cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.emailNotifications || false}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            emailNotifications: e.target.checked
                          }))}
                        />
                        <span className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-300 ${formData.emailNotifications ? 'left-[1.35rem]' : 'left-0.5'} top-0.5`}></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-light mb-4">Account</h2>
                  <div className="space-y-4">
                    <button 
                      className="text-sm text-white/70 hover:text-white transition-colors duration-300 block"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Change Password
                    </button>
                    
                    <button 
                      className="text-sm text-red-400 hover:text-red-300 transition-colors duration-300 block"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black p-6 border border-white/10 w-full max-w-md"
          >
            <h2 className="text-xl font-light tracking-wider mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="newPassword" 
                  className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                />
              </div>
              
              {passwordError && (
                <p className="text-red-400 text-xs tracking-wider">{passwordError}</p>
              )}
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordFormData({ newPassword: '', confirmPassword: '' });
                    setPasswordError(null);
                  }}
                  className="px-6 py-3 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={localLoading || !passwordFormData.newPassword || !passwordFormData.confirmPassword}
                  className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
                >
                  {localLoading ? "Processing..." : "Continue"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black p-6 border border-white/10 w-full max-w-md"
          >
            <h2 className="text-xl font-light tracking-wider mb-6">Verify OTP</h2>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full mx-auto border border-white/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 7.1C22 6.5 21.5 6 20.9 6L3.1 6C2.5 6 2 6.5 2 7.1L2 16.9C2 17.5 2.5 18 3.1 18L20.9 18C21.5 18 22 17.5 22 16.9L22 7.1Z"></path>
                  <polyline points="22,7 12,13 2,7"></polyline>
                </svg>
              </div>
              <p className="text-white/70 mb-2">A verification code has been sent to your email</p>
              <p className="text-white/50 text-sm">Enter the 6-digit code below to verify your password change</p>
            </div>
            
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
              <div className="flex justify-center">
                <PinInput
                  length={6}
                  focus
                  type="numeric"
                  inputMode="number"
                  onChange={(value) => setOtp(value)}
                  style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}
                  inputStyle={{ 
                    width: '40px', 
                    height: '50px', 
                    backgroundColor: 'transparent',
                    borderWidth: '1px',
                    borderColor: 'rgba(255, 255, 255, 0.3)', 
                    color: 'white',
                    fontSize: '18px',
                    borderRadius: '0'
                  }}
                  inputFocusStyle={{
                    borderColor: 'white'
                  }}
                />
              </div>
              
              {passwordError && (
                <p className="text-red-400 text-xs tracking-wider text-center">{passwordError}</p>
              )}
              
              <p className="text-white/50 text-xs text-center">
                Resend code in {timer > 0 ? `${timer}s` : "0s"}
              </p>
              
              <div className="flex flex-col gap-4 items-center">
                <button 
                  type="submit"
                  disabled={localLoading || otp.length < 6}
                  className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50 w-full"
                >
                  {localLoading ? "Verifying..." : "Verify"}
                </button>
                
                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={isResendDisabled || localLoading}
                  className="text-white/50 text-xs tracking-wider uppercase hover:text-white disabled:opacity-30 disabled:hover:text-white/50"
                >
                  Resend Code
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtp('');
                    setPasswordFormData({ newPassword: '', confirmPassword: '' });
                    setPasswordError(null);
                  }}
                  className="text-white/50 text-xs tracking-wider uppercase hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black p-6 border border-white/10 w-full max-w-md"
          >
            <h2 className="text-xl font-light tracking-wider mb-6">Delete Account</h2>
            
            <div className="space-y-6">
              <p className="text-white/70">
                This action is permanent and cannot be undone. All your data will be permanently removed.
              </p>
              
              <p className="text-white/50 text-sm">
                To confirm deletion, we'll send a verification code to your email.
              </p>
              
              {deleteError && (
                <p className="text-red-400 text-xs tracking-wider">{deleteError}</p>
              )}
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError(null);
                  }}
                  className="px-6 py-3 border border-white/30 text-white text-xs tracking-wider uppercase hover:border-white transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRequest}
                  disabled={localLoading}
                  className="px-6 py-3 bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
                >
                  {localLoading ? "Processing..." : "Proceed"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account OTP Modal */}
      {showDeleteOtpModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black p-6 border border-white/10 w-full max-w-md"
          >
            <h2 className="text-xl font-light tracking-wider mb-6">Verify Deletion</h2>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full mx-auto border border-white/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 7.1C22 6.5 21.5 6 20.9 6L3.1 6C2.5 6 2 6.5 2 7.1L2 16.9C2 17.5 2.5 18 3.1 18L20.9 18C21.5 18 22 17.5 22 16.9L22 7.1Z"></path>
                  <polyline points="22,7 12,13 2,7"></polyline>
                </svg>
              </div>
              <p className="text-white/70 mb-2">A verification code has been sent to your email</p>
              <p className="text-white/50 text-sm">Enter the 6-digit code below to confirm account deletion</p>
            </div>
            
            <form onSubmit={handleDeleteOtpSubmit} className="flex flex-col gap-6">
              <div className="flex justify-center">
                <PinInput
                  length={6}
                  focus
                  type="numeric"
                  inputMode="number"
                  onChange={(value) => setDeleteOtp(value)}
                  style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}
                  inputStyle={{ 
                    width: '40px', 
                    height: '50px', 
                    backgroundColor: 'transparent',
                    borderWidth: '1px',
                    borderColor: 'rgba(255, 255, 255, 0.3)', 
                    color: 'white',
                    fontSize: '18px',
                    borderRadius: '0'
                  }}
                  inputFocusStyle={{
                    borderColor: 'white'
                  }}
                />
              </div>
              
              {deleteError && (
                <p className="text-red-400 text-xs tracking-wider text-center">{deleteError}</p>
              )}
              
              <p className="text-white/50 text-xs text-center">
                Resend code in {deleteTimer > 0 ? `${deleteTimer}s` : "0s"}
              </p>
              
              <div className="flex flex-col gap-4 items-center">
                <button 
                  type="submit"
                  disabled={localLoading || deleteOtp.length < 6}
                  className="px-6 py-3 bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50 w-full"
                >
                  {localLoading ? "Verifying..." : "Delete My Account"}
                </button>
                
                <button
                  type="button"
                  onClick={handleDeleteResendOTP}
                  disabled={deleteResendDisabled || localLoading}
                  className="text-white/50 text-xs tracking-wider uppercase hover:text-white disabled:opacity-30 disabled:hover:text-white/50"
                >
                  Resend Code
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteOtpModal(false);
                    setDeleteOtp('');
                    setDeleteError(null);
                  }}
                  className="text-white/50 text-xs tracking-wider uppercase hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
