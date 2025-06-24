import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { FaTrashCan, FaCheck } from "react-icons/fa6";
import { loadRazorpay, displayRazorpay } from "../utils/razorpay-utils";

export const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user?._id) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [user?._id, navigate]);

  // Fetch cart and address data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const [cartResponse, addressResponse] = await Promise.all([
          Axios(SummaryApi.getCartItem),
          Axios(SummaryApi.getUserAddress),
        ]);

        if (cartResponse.data.success) {
          setCartItems(
            cartResponse.data.data.map((cartItem) => ({
              ...cartItem.productId,
              cartId: cartItem._id,
              quantity: cartItem.quantity,
            }))
          );
        }

        if (addressResponse.data.success) {
          setAddresses(addressResponse.data.data);
          const defaultAddress = addressResponse.data.data.find(
            (addr) => addr.isDefault
          );
          setSelectedAddress(defaultAddress?._id || null);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load checkout data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);

  const handleRemoveAddress = async (addressId, e) => {
    e.stopPropagation();
    try {
      const response = await Axios({
        ...SummaryApi.deleteUserAddress,
        url: SummaryApi.deleteUserAddress.url.replace(":addressId", addressId),
      });

      if (response.data.success) {
        toast.success("Address removed successfully");
        setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
        if (selectedAddress === addressId) {
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove address");
    }
  };

  const calculateTotal = useMemo(() => {
    return cartItems
      .reduce((total, item) => {
        const discountedPrice = item.price * (1 - item.discount / 100);
        return total + discountedPrice * item.quantity;
      }, 0)
      .toFixed(2);
  }, [cartItems]);

  const handleCashOnDelivery = async () => {
     try {
      setCheckoutLoading(true);

      if (!selectedAddress) throw new Error("Please select a delivery address");
      if (cartItems.length === 0) throw new Error("Your cart is empty");

      // Format data to match your OrderModel
      const product_details = cartItems.map((item) => ({
        productId: item._id,
        name: item.name,
        image: item.image[0],
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
      }));



      const response = await Axios({
        ...SummaryApi.cashOnDelivery,
        data: {
          product_details: product_details,
          delivery_address: selectedAddress,
          totalAmt: calculateTotal,
          subTotalAmt: calculateTotal,
        },
      });
      

      if (response.data.success) {
        toast.success("COD Order Placed Successfully!")
        navigate("/myorder", {
                state: {
                  orderId: response.data.data.orderId,
                  CodshowSuccess: true,
                },
              })
        
       
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place COD order");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      setCheckoutLoading(true);

      if (!selectedAddress) throw new Error("Please select a delivery address");
      if (cartItems.length === 0) throw new Error("Your cart is empty");

      const product_details = cartItems.map((item) => ({
        productId: item._id,
        name: item.name,
        image: item.image?.[0] || "",
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
      }));

      // 1. Create order on backend
      const response = await Axios({
        ...SummaryApi.onlinePayment,
        data: {
          product_details,
          delivery_address: selectedAddress,
          totalAmt: calculateTotal,
          subTotalAmt: calculateTotal,
        },
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to create payment order"
        );
      }

      const paymentData = response.data.data;

      // 2. Load Razorpay script
      await loadRazorpay();

      // 3. Setup Razorpay options
      const options = {
        key: paymentData.razorpay.key,
        amount: paymentData.razorpay.amount,
        currency: paymentData.razorpay.currency,
        name: "Crackit",
        description: "Order Payment",
        order_id: paymentData.razorpay.orderId, // Important: lowercase `order_id`

        handler: async function (response) {
          try {
            ``;
            const verificationResponse = await Axios({
              ...SummaryApi.verifyPayment,
              data: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verificationResponse.data.success) {
              toast.success("Payment successful! Order confirmed.");
              navigate("/myorder", {
                state: {
                  orderId: verificationResponse.data.data.orderId,
                  showSuccess: true,
                },
              });
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed"
            );
          }
        },

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },

        notes: {
          orderId: paymentData.orderId, // your internal orderId
        },

        theme: {
          color: "#6366f1",
        },

        modal: {
          ondismiss: async function () {
            try {
              await Axios({
                ...SummaryApi.paymentFailed,
                data: {
                  razorpay_order_id: paymentData.razorpay.orderId,
                },
              });
              toast.warning("Payment was not completed");
            } catch (error) {
              console.error("Failed to update payment status:", error);
            }
          },
        },
      };

      // 4. Open Razorpay popup
      await displayRazorpay(options);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Payment failed"
      );
    } finally {
      setCheckoutLoading(false);
    }
  };
  const handlePlaceOrder = async () => {
    try {
      if (paymentMethod === "cod") {
        await handleCashOnDelivery();
      } else {
        await handleOnlinePayment();
      }
    } catch (error) {
      console.error("Order placement error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white mx-auto p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-indigo-600">
          Check
          <span className="text-white">out</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <section className="bg-gray-700 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Delivery Address</h2>
                <button
                  className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center"
                  onClick={() => navigate("/address")}
                >
                  <span className="mr-1">+</span> Add New Address
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 border rounded-lg transition-all cursor-pointer relative ${
                        selectedAddress === address._id
                          ? "border-indigo-500 bg-gray-600/50 ring-1 ring-indigo-500"
                          : "border-gray-600 hover:bg-gray-600/30"
                      }`}
                      onClick={() => setSelectedAddress(address._id)}
                    >
                      {selectedAddress === address._id && (
                        <div className="absolute top-1 right-1 bg-indigo-500 rounded-full p-1">
                          <FaCheck className="text-xs" />
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{address.name}</h3>
                            {address.isDefault && (
                              <span className="bg-indigo-600 text-xs px-2 py-1 rounded ml-2">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 mt-1 text-sm">
                            {address.address_line}, {address.city},{" "}
                            {address.state} - {address.pincode}
                          </p>
                          <p className="text-gray-300 text-sm mt-1">
                            Phone: {address.mobile}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleRemoveAddress(address._id, e)}
                          className="ml-4 text-red-400 hover:text-red-300 p-1"
                          aria-label="Delete address"
                        >
                          <FaTrashCan size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                  <p className="text-gray-400 mb-3">No addresses found</p>
                  <button
                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center justify-center mx-auto"
                    onClick={() => navigate("/address")}
                  >
                    <span className="mr-1">+</span> Add New Address
                  </button>
                </div>
              )}
            </section>

            {/* Payment Method Section */}
            <section className="bg-gray-700 rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Online Payment Button */}
                <button
                  onClick={() => setPaymentMethod("online")}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    paymentMethod === "online"
                      ? "border-indigo-500 bg-gray-600/50 ring-1 ring-indigo-500"
                      : "border-gray-600 hover:bg-gray-600/30"
                  }`}
                  aria-label="Select online payment"
                >
                  <div className="flex items-center">
                    <div
                      className={`h-5 w-5 rounded-full border mr-3 flex items-center justify-center ${
                        paymentMethod === "online"
                          ? "bg-indigo-500 border-indigo-500"
                          : "border-gray-400"
                      }`}
                    >
                      {paymentMethod === "online" && (
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Online Payment</span>
                      <p className="text-gray-300 text-sm mt-1">
                        Pay now with credit/debit card or UPI
                      </p>
                    </div>
                  </div>
                </button>

                {/* Cash On Delivery Button */}
                <button
                  onClick={() => setPaymentMethod("cod")}
                  disabled
                  className={`p-4 border rounded-lg text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-indigo-500 bg-gray-600/50 ring-1 ring-indigo-500"
                      : "border-gray-600 hover:bg-gray-600/30"
                  }`}
                  aria-label="Select cash on delivery"
                >
                  <div className="flex items-center">
                    <div
                      className={`h-5 w-5 rounded-full border mr-3 flex items-center justify-center ${
                        paymentMethod === "cod"
                          ? "bg-indigo-500 border-indigo-500"
                          : "border-gray-400"
                      }`}
                    >
                      {paymentMethod === "cod" && (
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Cash On Delivery</span>
                      <p className="text-gray-300 text-sm mt-1">
                        Pay When It Arrives
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-4 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex justify-between items-center pb-4 border-b border-gray-700"
                    >
                      <div className="flex items-center">
                        <img
                          src={item.image?.[0] || "/placeholder-product.jpg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded mr-3"
                          onError={(e) => {
                            e.target.src = "/placeholder-product.jpg";
                          }}
                          loading="lazy"
                        />
                        <div>
                          <h3 className="font-medium line-clamp-1 text-sm">
                            {item.name}
                          </h3>
                          <p className="text-gray-400 text-xs">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₹
                          {(
                            (item.price - (item.price * item.discount) / 100) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Your cart is empty
                  </p>
                )}
              </div>

              <div className="border-t border-gray-700 my-4"></div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total</span>
                  <span>₹{calculateTotal}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  !selectedAddress || cartItems.length === 0 || checkoutLoading
                }
                className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  !selectedAddress || cartItems.length === 0 || checkoutLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {checkoutLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : paymentMethod === "cod" ? (
                  "Place COD Order"
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
