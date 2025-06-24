import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { FaBox, FaCheckCircle, FaTruck, FaHome, FaArrowLeft, FaPrint } from 'react-icons/fa';

export const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Axios({
        ...SummaryApi.getOrderDetail,
        url: SummaryApi.getOrderDetail.url.replace(':orderId', orderId)
      });

      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch order details');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch order details');
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <FaBox className="text-yellow-500" />;
      case 'shipped':
        return <FaTruck className="text-blue-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePrint = () => {
    window.print();
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
          <h2 className="text-xl font-semibold mb-2">Error Loading Order</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchOrderDetails}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors mr-2"
          >
            Retry
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6 bg-gray-800 rounded-lg max-w-md">
          <FaBox className="mx-auto text-4xl text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-4">The requested order could not be found</p>
          <button 
            onClick={() => navigate('/myorder')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 print:bg-white print:text-black">
      <ToastContainer theme='dark' />
      
      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-400 hover:text-indigo-300"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            <FaPrint className="mr-2" /> Print Invoice
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 print:bg-white print:border print:border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Order #{order.orderId}</h2>
              <p className="text-gray-400 text-sm">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center">
                {getStatusIcon(order.orderStatus)}
                <span className={`ml-2 font-semibold capitalize ${
                  order.orderStatus === 'delivered' ? 'text-green-500' : 
                  order.orderStatus === 'shipped' ? 'text-blue-500' :
                  'text-yellow-500'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Payment Method: {order.paymentDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
              <p className="text-gray-400 text-sm">
                Payment Status: {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Products */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 mb-6 print:bg-white print:border print:border-gray-300">
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <div className="space-y-4">
                {order.product_details.map((product, index) => (
                  <div key={index} className="flex border-b border-gray-700 pb-4 last:border-0">
                    <img 
                      src={product.image?.[0] || '/placeholder-product.jpg'} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded mr-4"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        ₹{(product.price * (1 - product.discount/100)).toFixed(2)} × {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₹{((product.price * (1 - product.discount/100)) * product.quantity).toFixed(2)}
                      </p>
                      {product.discount > 0 && (
                        <p className="text-sm text-green-500">
                          {product.discount}% off
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-800 rounded-lg p-6 print:bg-white print:border print:border-gray-300">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subTotalAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-3 mt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">₹{order.totalAmt.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Delivery Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 mb-6 print:bg-white print:border print:border-gray-300">
              <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
              {order.delivery_address ? (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaHome className="mt-1 mr-3 text-indigo-400" />
                    <div>
                      <h4 className="font-medium">{order.delivery_address.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {order.delivery_address.address_line}, {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Phone: {order.delivery_address.mobile}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No delivery address available</p>
              )}
            </div>

            {/* Order Timeline */}
            <div className="bg-gray-800 rounded-lg p-6 print:bg-white print:border print:border-gray-300">
              <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-3 h-3 rounded-full ${
                      ['processing', 'shipped', 'delivered'].includes(order.orderStatus) ? 
                      'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <div className={`w-0.5 h-8 ${
                      ['shipped', 'delivered'].includes(order.orderStatus) ? 
                      'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div>
                    <h4 className="font-medium">Order Placed</h4>
                    <p className="text-gray-400 text-sm">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-3 h-3 rounded-full ${
                      ['shipped', 'delivered'].includes(order.orderStatus) ? 
                      'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <div className={`w-0.5 h-8 ${
                      order.orderStatus === 'delivered' ? 
                      'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div>
                    <h4 className="font-medium">Shipped</h4>
                    {order.orderStatus === 'processing' ? (
                      <p className="text-gray-400 text-sm">Pending</p>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        {order.shippedAt ? formatDate(order.shippedAt) : 'In progress'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-3 h-3 rounded-full ${
                      order.orderStatus === 'delivered' ? 
                      'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div>
                    <h4 className="font-medium">Delivered</h4>
                    {order.orderStatus === 'delivered' ? (
                      <p className="text-gray-400 text-sm">
                        {order.deliveredAt ? formatDate(order.deliveredAt) : 'Completed'}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">Pending</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};