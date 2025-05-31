import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react';
import PinInput from 'react-pin-input';
import { API_CALL_PREFIX } from '../../config.js';
export default function Verification() {

  const location = useLocation();
  const email = location.state?.email;
  const formData = location.state?.formData;

  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

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

  console.log(email);
  
  const resendOTP = async()=>{
    // e.preventDefault();
    setTimer(30);
    setIsResendDisabled(true);
    try{
        const res = await fetch(`${API_CALL_PREFIX}/backend/auth/signup`,{
            method: "POST",
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if(data.success === false){
            setError(true);
            // setLoading(false);
            return;
        }
        setError(null);
    }
    catch(error){
        setError(error.message);
    }
  }

  const otpSubmit = async(e)=>{
    e.preventDefault();
    setError(null);
    if(otp.length < 6){
        setError("OTP must be 6 digits. Please re-enter.")
        return;
    }
    try {
        const res = await fetch(`${API_CALL_PREFIX}/backend/auth/verify-otp`,{
            method: "POST",
            headers:{
                'Content-Type': "application/json",
            },
            body: JSON.stringify({email, otp})
        });
        const data = await res.json();
        if(res.ok === false){
            setError(data.message);
            return;
        }
        navigate("/signin");
    } catch (error) {
        setError(error.message);
        return;
    }
  }
  console.log("verify page:-");
  
  console.log(email);
  

  return (
    <div className='bg-bg flex items-center justify-center min-h-screen px-4 py-8 font-serif'>
        {email &&
            <div className='bg-bg text-text-primary p-8 rounded-xl shadow-md w-full max-w-md border border-secondary'>
                <form onSubmit={otpSubmit} className='flex flex-col gap-6 justify-center items-center'>
                    <MailCheck size={48} className='text-secondary mb-2'/>
                    <p className='font-lg text-center text-text-muted'>A Verification Code has been sent to the email: <span className='font-semibold text-text-primary'>{email}</span></p>
                    <span className='font-lg text-text-muted'>Enter the Code below to proceed.</span>
                    <span className='text-sm text-text-muted'>Kindly check your spam folder.</span>
                    <PinInput
                        length={6}
                        id = 'otp'
                        focus
                        type="numeric"
                        inputMode="number"
                        onChange={(value) => setOtp(value)}
                        style={{ padding: "10px"}}
                        inputStyle={{ 
                            borderColor: "#7C8B84", // secondary color
                            borderWidth: 1,
                            borderRadius: "8px", // rounded-lg
                            margin: "0 4px",
                            color: "#2E2E2E", // text-primary
                            backgroundColor: "#FAF9F6" // bg
                        }}
                        inputFocusStyle={{borderColor: "#6A5D4D"}} // accent color
                    />
                    
                    {error && <p className='text-red-600 text-center text-sm'>{error}</p>}

                    <p className="text-text-muted text-sm mt-2">
                        Resend OTP in {timer > 0 ? `00:${timer < 10 ? `0${timer}` : timer}` : "00:00"}
                    </p>
                    <button className='p-3 rounded-lg text-bg bg-primary hover:bg-accent transition disabled:opacity-50 w-full shadow-md'>
                        Verify OTP
                    </button>
                    <button
                        onClick={resendOTP}
                        disabled={isResendDisabled}
                        className={`mt-2 text-secondary ${isResendDisabled ? "opacity-50 cursor-not-allowed" : "hover:underline hover:text-accent"}`}
                    >
                        Resend OTP
                    </button>
                </form>
            </div>
        }
        {/* {!email &&
            <div>Cannot satisfy request</div>
        } */}
    </div>
  )
}
