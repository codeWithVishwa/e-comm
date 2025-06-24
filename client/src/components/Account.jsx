import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { logout } from "../store/userSlice";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiLogOut,FiSettings } from "react-icons/fi";

export const Account = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navigateToAdminDashboard = () => {
    navigate("/admin/dashboard");
  };
  const EditUserAvatar = () => {
    navigate("/updateAvatar");
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user?._id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");

    try {
      const response = await Axios({
        ...SummaryApi.logout.method,
        url:SummaryApi.logout.url,
        headers:{
          'Cache-Control':'no-cache',
          'Pragma':'no-cache'
        }
      });

      if (response.data.success) {
        dispatch(logout());
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken")
        sessionStorage.clear();
        localStorage.clear();

        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.trim().split("=");
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        toast.update(toastId, {
          render: "Logged out successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
          onClose: () => {
            navigate("/", { replace: true });
            window.location.reload();
          },
        });
      } else {
        throw new Error(response.data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();

      toast.update(toastId, {
        render:
          error.response?.data?.message || "Logged out (server unavailable)",
        type: "warning",
        isLoading: false,
        autoClose: 3000,
        onClose: () => {
          navigate("/", { replace: true });
          window.location.reload();
        },
      });
    }
  };

  const handleEditProfile = () => {
    navigate("/updateUserDetail");
  };

  if (!user?._id) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4 py-18 animate-fade-in">
      <ToastContainer position="bottom-right" theme="dark" limit={3} />

      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 transform transition-all hover:scale-[1.01] duration-300 animate-float">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Account Details
          </h2>
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-indigo-600/30 flex items-center justify-center ring-2 ring-indigo-500/50 hover:ring-indigo-400 transition-all duration-300 overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={EditUserAvatar}
                />
              ) : (
                <span
                  className="text-xl font-medium text-indigo-300 cursor-pointer"
                  onClick={EditUserAvatar}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <div className="h-2 w-2 bg-green-900 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          {[
            { label: "ID", value: user._id, copyable: true },
            { label: "Name", value: user.name },
            { label: "Email", value: user.email, copyable: true },
            { label: "Phone", value: user.number },
            { label: "Status", value: user.status, badge: true },
            { label: "Role", value: user.role, badge: true },
          ].map((item) => (
            <div
              key={item.label}
              className="group flex items-start border-b border-white/10 pb-3 last:border-0 transition-all duration-200 hover:bg-white/5 hover:px-2 hover:-mx-2 hover:rounded-lg"
            >
              <span className="w-28 font-medium text-indigo-300/80 group-hover:text-indigo-300 transition-colors flex-shrink-0">
                {item.label}:
              </span>
              <div className="flex-1 min-w-0">
                {item.badge ? (
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      item.value === "Active"
                        ? "bg-green-500/20 text-green-500"
                        : item.value === "ADMIN"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {item.value}
                  </span>
                ) : (
                  <span
                    className={`text-white/90 group-hover:text-white transition-colors break-words ${
                      !item.value ? "text-white/50 italic" : ""
                    }`}
                    onClick={() => {
                      if (item.copyable) {
                        navigator.clipboard.writeText(item.value);
                        toast.dismiss()
                        toast.success(`${item.label} copied to clipboard`);
                      }
                    }}
                  >
                    {item.value || "Not provided"}
                    {item.copyable && (
                      <span className="ml-2 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        copy
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600/70 hover:bg-red-600 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>

          <button
            onClick={handleEditProfile}
            className="flex items-center px-4 py-2 bg-indigo-600/70 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
          >
            <FiEdit2 className="mr-2" />
            Edit Profile
          </button>
        </div>
        <div className="mt-8">
        {/* Admin Dashboard Button - Only visible for ADMIN role */}
        {user?.role === "ADMIN" && (
          <button
            onClick={navigateToAdminDashboard}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600/70 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <FiSettings className="mr-2" />
            Admin Dashboard
          </button>
        )}
        </div>
      </div>
    </div>
  );
};
