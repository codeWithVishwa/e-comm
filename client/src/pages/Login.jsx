import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEyeSlash, FaRegEye } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../store/userSlice";
import fetchUserDetails from '../utils/fetchUserDetails';



export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch=useDispatch()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.dismiss()
      toast.error("All fields are required");
      return;
    }
    try {
      const response = await Axios({
        ...SummaryApi.login,
        data: {
          email: formData.email,
          password: formData.password,
        },
      });

      if (response.data.error === false) {
        toast.success(response.data.message)
        localStorage.setItem('accesstoken',response.data.data.accesstoken)
        localStorage.setItem('refreshtoken',response.data.data.refreshtoken)

        const userDetails =await fetchUserDetails()
        dispatch(setUserDetails(userDetails.data))
        navigate("/"); // or wherever your app routes to


      } else {
        toast.dismiss();
        toast.error(response.data.message); // backend message like "Incorrect password"
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.dismiss();
        toast.error(error.response.data.message); // Use server message
      } else {
        toast.dismiss();
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <>
      <ToastContainer theme="dark" />
      <section className="bg-gray-900 w-full min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-lg bg-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-center text-white mb-6">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white pr-10"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 mt-5"
              >
                {showPassword ? (
                  <FaEyeSlash size={16} />
                ) : (
                  <FaRegEye size={16} />
                )}
              </button>
            </div>
            <Link
              to="/forgotpassword"
              className="text-blue-500 hover:underline text-sm block"
            >
              Forgot Password?
            </Link>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-400 hover:text-blue-300"
            >
              Register here
            </button>
          </p>
        </div>
      </section>
    </>
  );
};
