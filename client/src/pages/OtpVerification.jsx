import React, { useEffect, useState } from "react";
import { useLocation, useNavigate,Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

export const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location=useLocation()
  useEffect(()=>{
    if (!location?.state?.email) {
        navigate('/forgotpassword')
    }
  },[location,navigate])

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.dismiss();
      toast.error("Please enter OTP.");
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.verifyForgotPasswordOtp, // define this in your API config
        data: { 
            otp,
            email:location?.state?.email
         },
      });

      if (response.data.success) {
        toast.success("OTP verified successfully!");
        navigate("/reset-password",{
          state:{
            data:response.data,
            email:location?.state?.email
          }
        }); // take user to reset password page
      } else {
        toast.dismiss();
        toast.error(response.data.message || "Invalid OTP.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      <ToastContainer theme="colored" />
      <section className="bg-gray-900 w-full min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-lg bg-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-center text-white mb-6">
            Verify OTP
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only digits and max 6 characters
                  if (/^\d{0,6}$/.test(value)) {
                    setOtp(value);
                  }
                }}
                className="w-full px-4 py-2 rounded bg-gray-700 border text-2xl border-gray-600 text-white"
                placeholder="Enter 6-digit OTP"
                autoComplete="one-time-code"
              />
            </div>
            <Link to='/login' className="text-blue-500 block">Already have a Account?</Link>
            
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 transition duration-200 text-white font-semibold py-2 px-4 rounded"
            >
              Verify OTP
            </button>
          </form>
        </div>
      </section>
    </>
  );
};
