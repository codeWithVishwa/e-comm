import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import {
  FaSearch,
  FaFilter,
  FaUserShield,
  FaUserSlash,
  FaUserCheck,
  FaUserAlt,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
} from "react-icons/fa";
import moment from "moment";

export const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    userId: "",
    status: "",
    reason: "",
  });
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  // Check admin role
  useEffect(() => {
    if (!user.role === "ADMIN") {
      navigate("/");
      toast.error("Unauthorized access");
    }
  }, [user, navigate]);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.adminGetAllUsers,
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        },
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  // Handle status change
  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios({
        ...SummaryApi.adminUpdateUserStatus,
        url: SummaryApi.adminUpdateUserStatus.url.replace(
          ":userId",
          statusUpdate.userId
        ),
        data: {
          status: statusUpdate.status,
          reason: statusUpdate.reason,
        },
      });

      if (response.data.success) {
        toast.success("User status updated successfully");
        fetchUsers();
        setStatusUpdate({ userId: "", status: "", reason: "" });
        setShowUserDetails(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <span className="bg-green-900 text-green-100 text-xs font-medium px-2.5 py-0.5 rounded">
            <FaUserCheck className="inline mr-1" /> Active
          </span>
        );
      case "suspended":
        return (
          <span className="bg-yellow-900 text-yellow-100 text-xs font-medium px-2.5 py-0.5 rounded">
            <FaUserShield className="inline mr-1" /> Suspended
          </span>
        );
      case "banned":
        return (
          <span className="bg-red-900 text-red-100 text-xs font-medium px-2.5 py-0.5 rounded">
            <FaUserSlash className="inline mr-1" /> Banned
          </span>
        );
      default:
        return (
          <span className="bg-gray-700 text-gray-100 text-xs font-medium px-2.5 py-0.5 rounded">
            <FaUserAlt className="inline mr-1" /> Unknown
          </span>
        );
    }
  };

  // Render user details modal
  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-indigo-300">
                {selectedUser.name} ({selectedUser.email})
              </h2>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <h3 className="font-semibold text-lg mb-3 flex items-center text-indigo-200">
                  <FaUserAlt className="mr-2" /> Basic Information
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="font-medium text-gray-200">Name:</span>{" "}
                    {selectedUser.name}
                  </p>
                  <p>
                    <span className="font-medium text-gray-200">Email:</span>{" "}
                    {selectedUser.email}
                  </p>
                  <p>
                    <span className="font-medium text-gray-200">UserId:</span>{" "}
                    {selectedUser._id}
                  </p>
                  <p>
                    <span className="font-medium text-gray-200">Phone:</span>{" "}
                    {selectedUser.number || "Not provided"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-200">Joined:</span>{" "}
                    {moment(selectedUser.createdAt).format("LLL")}
                  </p>
                  <p>
                    <span className="font-medium text-gray-200">Status:</span>{" "}
                    {renderStatusBadge(selectedUser.status)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <h3 className="font-semibold text-lg mb-3 flex items-center text-indigo-200">
                  <FaShoppingBag className="mr-2" /> Order Statistics
                </h3>
                {selectedUser.orderStats ? (
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="font-medium text-gray-200">
                        Total Orders:
                      </span>{" "}
                      {selectedUser.orderStats.totalOrders}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">
                        Total Spent:
                      </span>{" "}
                      ₹
                      {selectedUser.orderStats.totalSpent?.toFixed(2) || "0.00"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">
                        Last Order:
                      </span>{" "}
                      {selectedUser.orderStats.lastOrderDate
                        ? moment(selectedUser.orderStats.lastOrderDate).format(
                            "LLL"
                          )
                        : "No orders yet"}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">No order data available</p>
                )}
              </div>

              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <h3 className="font-semibold text-lg mb-3 flex items-center text-indigo-200">
                  <FaMapMarkerAlt className="mr-2" /> Addresses (
                  {selectedUser.addresses?.length || 0})
                </h3>
                {selectedUser.addresses?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.addresses.map((address, index) => (
                      <div
                        key={index}
                        className={`border-l-4 ${
                          address.isDefault
                            ? "border-indigo-500"
                            : "border-gray-600"
                        } pl-3 py-1 text-gray-300`}
                      >
                        <p className="font-medium text-gray-200">
                          {address.name} {address.isDefault && "(Default)"}
                        </p>
                        <p>
                          {address.address_line}, {address.city},{" "}
                          {address.state} - {address.pincode}
                        </p>
                        <p>Phone: {address.mobile}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No addresses saved</p>
                )}
              </div>

              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <h3 className="font-semibold text-lg mb-3 flex items-center text-indigo-200">
                  <FaMoneyBillWave className="mr-2" /> Favorite Products
                </h3>
                {selectedUser.favoriteProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.favoriteProducts.map((product, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <img
                          src={product.image || "/placeholder-product.jpg"}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) => {
                            e.target.src = "/placeholder-product.jpg";
                          }}
                        />
                        <div className="text-gray-300">
                          <p className="font-medium text-gray-200">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            Ordered {product.totalQuantity} times
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No favorite products data</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="font-semibold text-lg mb-3 text-indigo-200">
                Update User Status
              </h3>
              <form onSubmit={handleStatusChange}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) =>
                        setStatusUpdate({
                          ...statusUpdate,
                          status: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={statusUpdate.reason}
                      onChange={(e) =>
                        setStatusUpdate({
                          ...statusUpdate,
                          reason: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Optional reason for status change"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDetails(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=" mx-auto px-4 py-8 bg-gray-900 min-h-screen ">
      <div className="mt-16">
        <h1 className="text-2xl font-bold mb-6 text-indigo-300">
          User Management
        </h1>

        {/* Search and Filter Bar */}
        <div className="bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search users by name, email or phone..."
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-300 placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700">
              <FaFilter className="mr-2" /> Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                      >
                        Orders
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                      >
                        Last Active
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.avatar ? (
                                <div className="flex-shrik-0 h-10 w-10 bg-gray-600 flex rounded-full items-center justify-center text-gray-300">
                                  <img src={user.avatar} alt="" className="rounded-full h-10 w-10" />
                                </div>
                              ) : (
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-200">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(user.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-200">
                              {user.orderStats?.totalOrders || 0}
                            </div>
                            <div className="text-sm text-gray-400">
                              ₹
                              {user.orderStats?.totalSpent?.toFixed(2) ||
                                "0.00"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {user.lastActive
                              ? moment(user.lastActive).fromNow()
                              : "Never"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setStatusUpdate({
                                  userId: user._id,
                                  status: user.status,
                                  reason: user.statusReason || "",
                                });
                                setShowUserDetails(true);
                              }}
                              className="text-indigo-400 hover:text-indigo-300 mr-3"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDetails(true);
                              }}
                              className="text-gray-400 hover:text-gray-300"
                            >
                              {showUserDetails &&
                              selectedUser?._id === user._id ? (
                                <FaChevronUp />
                              ) : (
                                <FaChevronDown />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-center text-sm text-gray-400"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        Showing{" "}
                        <span className="font-medium text-gray-300">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-gray-300">
                          {Math.min(
                            currentPage * itemsPerPage,
                            totalPages * itemsPerPage
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-300">
                          {totalPages * itemsPerPage}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? "z-10 bg-indigo-600 border-indigo-600 text-white"
                                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* User Details Modal */}
        {showUserDetails && renderUserDetails()}
      </div>
    </div>
  );
};
