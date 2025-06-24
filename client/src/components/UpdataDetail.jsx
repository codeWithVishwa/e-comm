import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiSave, FiArrowLeft, FiUser, FiMail, FiPhone } from "react-icons/fi";
//import { updateProfile } from "../store/userSlice";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import fetchUserDetails from "../utils/fetchUserDetails";
import { updateProfile } from "../store/userSlice";


export const UpdateDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        number: user.number || "",
      });
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.number && !/^\d{10}$/.test(formData.number)) {
      newErrors.number = "Invalid phone number (10 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await Axios.put(SummaryApi.updateUser.url, formData);

      if (response.data.success) {
        toast.dismiss()
        const userData=await fetchUserDetails()
        dispatch(updateProfile(userData.data))
        //dispatch(updateProfile(response.data?.data));
        toast.success("Profile updated successfully!");
        navigate("/account",{replace:true})
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?._id) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/account")}
            className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <FiArrowLeft className="text-white text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Edit Profile
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`bg-gray-800/50 border ${
                  errors.name ? "border-red-500" : "border-gray-700"
                } text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Ajith Kumar"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                readOnly
                className={`bg-gray-800/50 border ${
                  errors.email ? "border-red-500" : "border-gray-700"
                } text-gray-600 rounded-lg block w-full pl-10 p-2.5 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="number"
                value={formData.number}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    handleChange(e);
                  }
                }}
                maxLength={10}
                pattern="\d{10}"
                className={`bg-gray-800/50 border ${
                  errors.number ? "border-red-500" : "border-gray-700"
                } text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="1234567890"
              />
            </div>
            {errors.number && (
              <p className="mt-1 text-sm text-red-400">{errors.number}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              <FiSave className="mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
