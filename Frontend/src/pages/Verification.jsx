import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion';
import PinInput from 'react-pin-input';

export default function Verification() {
  const location = useLocation();
  const email = location.state?.email;
  const formData = location.state?.formData;

  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);
  
  const resendOTP = async() => {
    setTimer(30);
    setIsResendDisabled(true);
    setLoading(true);
    try{
        const res = await fetch("/backend/auth/signup",{
            method: "POST",
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if(data.success === false){
            setError(data.message || "Failed to resend OTP");
            return;
        }
        setError(null);
    }
    catch(error){
        setError(error.message);
    }
    finally {
        setLoading(false);
    }
  }

  const otpSubmit = async(e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if(otp.length < 6){
        setError("OTP must be 6 digits. Please re-enter.");
        setLoading(false);
        return;
    }
    
    try {
        const res = await fetch("/backend/auth/verify-otp",{
            method: "POST",
            headers:{
                'Content-Type': "application/json",
            },
            body: JSON.stringify({email, otp})
        });
        const data = await res.json();
        if(res.ok === false){
            setError(data.message);
            setLoading(false);
            return;
        }
        navigate("/signin");
    } catch (error) {
        setError(error.message);
        setLoading(false);
        return;
    }
  }

  if (!email) {
    return (
      <div className="flex min-h-screen bg-black text-white items-center justify-center">
        <div className="text-center p-8">
          <p className="text-lg font-light tracking-wider">Unable to process request. Please return to signup.</p>
          <button 
            onClick={() => navigate('/signup')}
            className="mt-6 px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light"
          >
            Back to Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 border border-white/10"
      >
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-light tracking-widest uppercase mb-6">Verification</h1>
            <div className="w-16 h-16 rounded-full mx-auto border border-white/30 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 7.1C22 6.5 21.5 6 20.9 6L3.1 6C2.5 6 2 6.5 2 7.1L2 16.9C2 17.5 2.5 18 3.1 18L20.9 18C21.5 18 22 17.5 22 16.9L22 7.1Z"></path>
                <polyline points="22,7 12,13 2,7"></polyline>
              </svg>
            </div>
            <p className="text-white/70 mb-2">A verification code has been sent to:</p>
            <p className="font-light tracking-wide mb-6">{email}</p>
            <p className="text-white/50 text-sm">Enter the 6-digit code below to verify your email</p>
          </div>
          
          {/* OTP Input */}
          <form onSubmit={otpSubmit} className="flex flex-col gap-6">
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
            
            {error && (
              <p className="text-red-400 text-xs tracking-wider text-center">{error}</p>
            )}
            
            <p className="text-white/50 text-xs text-center">
              Resend code in {timer > 0 ? `${timer}s` : "0s"}
            </p>
            
            <button 
              type="submit"
              disabled={loading || otp.length < 6}
              className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50 w-full"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            
            <button
              type="button"
              onClick={resendOTP}
              disabled={isResendDisabled || loading}
              className="text-white/50 text-xs tracking-wider uppercase hover:text-white disabled:opacity-30 disabled:hover:text-white/50"
            >
              Resend Code
            </button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-white/50 text-xs">
              Didn&apos;t receive the code? Check your spam folder.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
