import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate,useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { FaBox, FaCheckCircle, FaTruck } from "react-icons/fa";

export const Myorder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.state?.showSuccess) {
      toast.success("Payment successful! Order confirmed.");

      navigate(location.pathname,{replace:true})
    }
    if(location.state?.CodshowSuccess){
      toast.success("Order Placed Successfully")
    }
  }, [location,navigate]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await Axios({
        ...SummaryApi.getUserOrders,
        url: `${SummaryApi.getUserOrders.url}?page=${page}&limit=${pagination.limit}`,
        
      
      });

      if (response.data.success) {
        setOrders(response.data.data.orders || []);
        setPagination(response.data.data.pagination || pagination);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) {
      navigate("/login", { state: { from: "/myorder" } });
      return;
    }
    fetchOrders();
  }, [user?._id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return <FaBox className="text-yellow-500" />;
      case "shipped":
        return <FaTruck className="text-blue-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6 bg-gray-800 rounded-lg max-w-md">
          <FaBox className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <ToastContainer theme="dark" />

      <div className="max-w-7xl mx-auto mt-20">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-8">My<span className="text-indigo-600">Orders</span></h1>

        {orders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <FaBox className="mx-auto text-5xl text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-gray-400 mb-4">
              You haven't placed any orders yet
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
                >
                  <div className="p-4 md:p-6 border-b border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center space-x-4 mb-3 md:mb-0">
                        {getStatusIcon(order.orderStatus || "processing")}
                        <div>
                          <h3 className="font-semibold">
                            Order #{order.orderId}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                        <div className="mb-2 sm:mb-0">
                          <p className="text-sm text-gray-400">Total Amount</p>
                          <p className="font-semibold">
                            ₹{order.totalAmt.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className="font-semibold capitalize text-yellow-500">
                            {order.orderStatus || "processing"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-6 bg-gray-700/50">
                    <button
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      View Order Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded-md bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        pagination.page === page
                          ? "bg-indigo-600"
                          : "bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 rounded-md bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};