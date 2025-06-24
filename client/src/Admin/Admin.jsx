import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DashboardCard from "./DashboardCard";
import {
  FiArrowLeft,
  FiUsers,
  FiSettings,
  FiPieChart,
  FiMessageCircle,
} from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";

export const AdminDashboard = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Verify admin status and redirect if not authorized
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      toast.error("Unauthorized access");
      navigate("/account");
      return;
    }

    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold">
          Verifying admin privileges...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 ">
      {/* Admin Header */}
      <header className=" shadow-sm pt-16">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-3xl font-extrabold text-white">
            <FaShieldAlt className="text-indigo-600 drop-shadow-md" />
            <span className="text-white/90 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]">
              Admin
            </span>
          </h2>

          <button
            onClick={() => navigate("/account")}
            className="mx-3 flex items-center text-sm font-medium text-gray-400 hover:text-purple-600"
          >
            <FiArrowLeft className="mr-1" />
            Back to Account
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px ">
        <div className="text-2xl mb-5">
          <h1>
            <span className="text-3xl font-bold font-display">Welcome, </span>
            {user.name}
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {/* Admin Cards */}
          <DashboardCard
            icon={<FiUsers className="h-8 w-8" />}
            title="User Management"
            description="Manage all user accounts and permissions"
            onClick={() => navigate("/admin/users")}
            color="red"
          />

          <DashboardCard
            icon={<FiSettings className="h-8 w-8" />}
            title="Product Management Settings"
            description="Create,Update and Delete products"
            onClick={() => navigate("/admin/productsEdit")}
            color="blue"
          />

          <DashboardCard
            icon={<FiPieChart className="h-8 w-8" />}
            title="Order Management"
            description="View Users Orders and Status"
            onClick={() => navigate("/admin/orders")}
            color="green"
          />
          <DashboardCard
            icon={<FiMessageCircle className="h-8 w-8" />}
            title="Manage Reports & Messages"
            description="View Users Reports and Message"
            onClick={() => navigate("/admin/message")}
            color="orange"
          />

          {/* Add more admin features as needed */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
