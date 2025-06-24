import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX, FiCheck, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { setUserDetails, updateAvatar } from "../store/userSlice";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import fetchUserDetails from "../utils/fetchUserDetails";

const UserProfileAvatarEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user); // fix selector to get user from state.user
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set initial preview from user's current avatar
  useEffect(() => {
    if (user?.avatar) {
      setPreview(user.avatar);
    }
  }, [user]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user?._id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG)");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const response = await Axios.post(SummaryApi.uploadAvatar.url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // added in case auth cookies are needed
      });

      if (response.data.success) {
        const userData=await fetchUserDetails()
        dispatch(updateAvatar(userData.data.avatar))
        toast.success("Profile picture updated successfully!");
        navigate("/account");
      } else {
        throw new Error(response.data.message || "Failed to update avatar");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(user?.avatar || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Avoid rendering anything if user not logged in (redirect handled by useEffect)
  if (!user?._id) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Update Profile Picture
        </h2>

        {/* Avatar Preview */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-700/50 flex items-center justify-center overflow-hidden border-2 border-indigo-400/50">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-6xl text-gray-400" />
              )}
            </div>
            {selectedFile && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-2 border-gray-900">
                <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* File Input */}
        <div className="flex flex-col items-center mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors select-none"
          >
            <FiUpload className="mr-2" />
            {selectedFile ? "Change Image" : "Select Image"}
          </label>
          <p className="text-xs text-gray-400 mt-2">JPG, PNG (Max 2MB)</p>
        </div>

        {/* Action Buttons */}
        {selectedFile && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <FiX className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                "Uploading..."
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileAvatarEdit;