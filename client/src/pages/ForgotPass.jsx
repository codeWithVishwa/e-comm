import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import {useNavigate,Link } from "react-router-dom";


export const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const navigate =useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.dismiss();
      toast.error("Please enter your email.");
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.forgotPassword, 
        data: { email },
      });

      if (response.data.success) {
        toast.dismiss()
        navigate("/otpverification",{state:{email}})
        toast.success(response.data.message || "OTP send successfully");


    
      } else {
        toast.dismiss()
        toast.error(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.dismiss()
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      <ToastContainer theme="colored" />
      <section className="bg-gray-900 w-full min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-lg bg-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-center text-white mb-6">
            Forgot Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            <Link to="/login" className="text-blue-500 block">Already have a Account?</Link>
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 transition duration-200 text-white font-semibold py-2 px-4 rounded"
            >
              Send OTP
            </button>
          </form> 
        </div>
      </section>
    </>
  );
};
