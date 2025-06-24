import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash, FaRegEye } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "", // ✅ added
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    toast.dismiss();

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      toast.error("Name is required");
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      toast.error("Email is required");
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      toast.error("Please enter a valid email");
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      toast.error("Mobile number is required");
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Mobile number must be 10 digits";
      toast.error("Enter a valid 10-digit mobile number");
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      toast.error("Password is required");
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      toast.error("Password must be at least 8 characters");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      toast.error("Passwords do not match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await Axios({
        ...SummaryApi.register,
        data: {
          name: formData.name,
          email: formData.email,
          number: formData.mobile,
          password: formData.password,
        },
      });

      const { error, message } = response.data;

      if (!error) {
        toast.success("Registration successful!");
        setFormData({
          name: "",
          email: "",
          mobile: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        toast.error(message || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Oops! Something went wrong while registering.");
    }
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.mobile &&
      formData.password &&
      formData.confirmPassword
    );
  };

  const handleLoginRedirect = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />

      <section className="bg-gray-900 w-full min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-lg bg-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-center text-white mb-4 sm:text-2xl sm:mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Enter your name"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Enter your 10-digit mobile number"
              />
              {errors.mobile && <p className="text-xs text-red-400">{errors.mobile}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded bg-gray-700 border border-gray-600 text-white pr-8"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaRegEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded bg-gray-700 border border-gray-600 text-white pr-8"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaRegEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-2 px-4 text-sm rounded font-medium mt-2 sm:text-base sm:py-2.5 ${
                isFormValid()
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-500 cursor-not-allowed text-gray-300"
              }`}
            >
              Register
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-3 text-center text-xs text-gray-400 sm:text-sm sm:mt-4">
            Already have an account?{" "}
            <button
              onClick={handleLoginRedirect}
              className="text-blue-400 hover:text-blue-300 focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </div>
      </section>
    </>
  );
};
