import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';

// Predefined status colors for Tailwind CSS
const statusColors = {
  PENDING: 'bg-yellow-900 text-yellow-200',
  PROCESSING: 'bg-blue-900 text-blue-200',
  SHIPPED: 'bg-indigo-900 text-indigo-200',
  DELIVERED: 'bg-green-900 text-green-200',
  CANCELLED: 'bg-red-900 text-red-200',
  PENDING_PAYMENT:'bg-orange-900 text-orange-200'
};

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'PENDING_PAYMENT',label:'Pending_payment'}
];

export const AdminOrders = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    status: '',
    userId: '',
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  }, [user, navigate]);

  // Fetch orders when filters or pagination changes
  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchOrders();
    }
  }, [pagination.page, filters.status, filters.userId, filters.search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;
      const { status, userId, search } = filters;
      
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(userId && { userId }),
        ...(search && { search })
      });

      const response = await Axios({
        ...SummaryApi.getAdminOrder,
        url: `${SummaryApi.getAdminOrder.url}?${params.toString()}`,
      });
      
      setOrders(response.data.data.orders);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total,
        totalPages: response.data.data.pagination.totalPages
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await Axios({
        ...SummaryApi.updateOrderStatus,
        url: SummaryApi.updateOrderStatus.url.replace(':orderId', orderId),
        data: { status: newStatus }
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh orders
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const renderMobileOrderCard = (order) => (
    <div key={order._id} className="p-4 rounded-lg bg-gray-800 hover:bg-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold">#{order.orderId}</div>
          <div className="text-sm text-gray-300">
            {format(new Date(order.createdAt), 'dd MMM yyyy')}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-900 text-gray-200'}`}>
          {order.status}
        </span>
      </div>
      
      <div className="mt-2">
        {order.user ? (
          <div className="text-sm">
            <span className="font-medium">{order.user.name}</span>
            <span className="text-gray-400 ml-2">{order.products.length} item{order.products.length !== 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="text-sm">Guest - {order.products.length} item{order.products.length !== 1 ? 's' : ''}</div>
        )}
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <div className="font-bold">{formatCurrency(order.totalAmount)}</div>
        <button 
          onClick={() => handleViewDetails(order)}
          className="px-3 py-1 text-sm rounded border border-gray-600 hover:bg-gray-700"
          aria-label={`View order ${order.orderId} details`}
        >
          View
        </button>
      </div>
    </div>
  );

  const renderDesktopOrderRow = (order) => (
    <tr key={order._id} className="hover:bg-gray-700">
      <td className="px-4 py-4 whitespace-nowrap">{order.orderId}</td>
      <td className="px-4 py-4 whitespace-nowrap">
        {order.user ? (
          <div>
            <div className="font-medium">{order.user.name}</div>
            <div className="text-sm text-gray-300">
              {order.user.email}
            </div>
          </div>
        ) : 'Guest'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {order.products.length} item{order.products.length !== 1 ? 's' : ''}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {formatCurrency(order.totalAmount)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-900 text-gray-200'}`}>
          {order.status}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <button 
          onClick={() => handleViewDetails(order)}
          className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700"
          aria-label={`View order ${order.orderId} details`}
        >
          View
        </button>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className='mt-16'>
        <h1 className="text-2xl text-indigo-300 md:text-3xl font-bold mb-6">Order Management</h1>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-48">
            <label htmlFor="status-filter" className="block mb-2 text-gray-300">Status</label>
            <select
              id="status-filter"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 rounded border bg-gray-800 border-gray-700 text-white"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="user-id-filter" className="block mb-2 text-gray-300">User ID</label>
            <input
              id="user-id-filter"
              name="userId"
              type="text"
              value={filters.userId}
              onChange={handleFilterChange}
              className="w-full p-2 rounded border bg-gray-800 border-gray-700 text-white"
              placeholder="Enter User ID"
            />
          </div>
        </div>
        
        {/* Orders Table */}
        {isMobile ? (
          /* Mobile View - Cards */
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse p-4 rounded-lg bg-gray-800 h-32"></div>
              ))
            ) : orders.length === 0 ? (
              <div className="text-center p-4 text-gray-400">
                No orders found
              </div>
            ) : (
              orders.map(renderMobileOrderCard)
            )}
          </div>
        ) : (
          /* Desktop View - Table */
          <div className="rounded-lg overflow-hidden shadow bg-gray-800">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center">
                      <div className="animate-pulse flex justify-center">
                        <div className="h-4 w-32 bg-gray-600 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map(renderDesktopOrderRow)
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800">
              <button
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center disabled:opacity-50"
                aria-label="Previous page"
              >
                &lt;
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base ${pagination.page === pageNum 
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700'}`}
                    aria-label={`Page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center disabled:opacity-50"
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
        
        {/* Order Details Dialog */}
        {openDialog && selectedOrder && (
          <div className="fixed inset-0 bg-black/40 bg-opacity-100 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto bg-gray-800">
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl md:text-2xl font-bold">Order #{selectedOrder.orderId}</h2>
                  <button 
                    onClick={handleCloseDialog}
                    className="p-2 rounded-full hover:bg-gray-700"
                    aria-label="Close order details"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg md:text-xl font-semibold">Customer Information</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                        disabled={updatingStatus}
                        className="p-1 rounded border bg-gray-700 border-gray-600 text-sm"
                        aria-label="Update order status"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {selectedOrder.user ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold bg-gray-700">
                        {selectedOrder.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{selectedOrder.user.name}</div>
                        <div className="text-sm text-gray-300">
                          {selectedOrder.user.email}
                        </div>
                        <div className="text-sm text-gray-300">
                          {selectedOrder.user.phone}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>Guest Order</div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-3">Delivery Address</h3>
                  {selectedOrder.deliveryAddress ? (
                    <div className="text-sm md:text-base">
                      <div className="font-medium">{selectedOrder.deliveryAddress.recipient}</div>
                      <div>{selectedOrder.deliveryAddress.address.line}</div>
                      <div>{selectedOrder.deliveryAddress.address.city}, {selectedOrder.deliveryAddress.address.state}</div>
                      <div>{selectedOrder.deliveryAddress.address.country} - {selectedOrder.deliveryAddress.address.pincode}</div>
                      <div className="mt-2">
                        Phone: {selectedOrder.deliveryAddress.contact.mobile}
                        {selectedOrder.deliveryAddress.contact.alternatePhone && (
                          `, ${selectedOrder.deliveryAddress.contact.alternatePhone}`
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>No delivery address provided</div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-3">Order Items</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-700">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-3 py-2 text-left text-sm">Product</th>
                            <th className="px-3 py-2 text-left text-sm">Price</th>
                            <th className="px-3 py-2 text-left text-sm">Qty</th>
                            <th className="px-3 py-2 text-left text-sm">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {selectedOrder.products.map((product, index) => (
                            <tr key={index}>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 md:w-14 md:h-14 rounded flex items-center justify-center bg-gray-700">
                                    {product.image ? (
                                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                    ) : (
                                      <span className="text-xs text-gray-500">No image</span>
                                    )}
                                  </div>
                                  <div className="text-sm md:text-base">{product.name}</div>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm md:text-base">{formatCurrency(product.price)}</td>
                              <td className="px-3 py-3 text-sm md:text-base">{product.quantity}</td>
                              <td className="px-3 py-3 text-sm md:text-base">{formatCurrency(product.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 border-t border-gray-700">
                  <div className="mb-3 md:mb-0">
                    <div className="text-sm text-gray-300">
                      <strong>Order Date:</strong> {format(new Date(selectedOrder.createdAt), 'dd MMM yyyy HH:mm')}
                    </div>
                    <div className="text-sm text-gray-300">
                      <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                    </div>
                    <div className="text-sm text-gray-300">
                      <strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'N/A'}
                    </div>
                  </div>
                  <div className="text-lg md:text-xl font-bold">
                    <strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};