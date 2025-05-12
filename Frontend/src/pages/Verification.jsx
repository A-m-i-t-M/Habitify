import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react';
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
        const res = await fetch("/backend/auth/signup",{
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
    <div className='bg-gray-900 flex items-center justify-center min-h-screen bg-cover bg-center px-4'>
        {email &&
            <div className=' bg-gray-900 text-white p-8 rounded-xl shadow-lg w-full max-w-md border border-white'>
                <form onSubmit={otpSubmit} className='flex flex-col gap-6 justify-center items-center'>
                    <MailCheck size={50} className='text-green-600'/>
                    <p className='font-lg text-center'>A Verification Code has been sent to the newly registered email: <span className='font-semibold'>{email}</span></p>
                    <span className='font-lg'>Enter the Code below to proceed.</span>
                    <span>Kindly check your spam</span>
                    <PinInput
                        length={6}
                        id = 'otp'
                        focus
                        type="numeric"
                        inputMode="number"
                        onChange={(value) => setOtp(value)}
                        style={{ padding: "10px", }}
                        inputStyle={{ borderColor: "gray", borderWidth: 2 ,borderRadius: "16px" }}
                    />
                    
                    {error && <p className='text-red-700 text-center'>{error}</p>}

                    <p className="text-gray-500 text-sm mt-2">
                        Resend OTP in {timer > 0 ? `00:${timer < 10 ? `0${timer}` : timer}` : "00:00"}
                    </p>
                    <button className='p-3 rounded-3xl text-white bg-green-600 transition disabled:opacity-50 w-full'>
                        Verify OTP
                    </button>
                    <button
                        onClick={resendOTP}
                        disabled={isResendDisabled}
                        className={`mt-2 text-blue-600 ${isResendDisabled ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
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
