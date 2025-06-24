import React, { useCallback, useEffect } from "react";
import { toast,ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useNavigate } from "react-router-dom";


const Cart = ({ cartItems, setCartItems, showCart, setShowCart }) => {
  
  const navigate=useNavigate()
  

  const calculateTotal = useCallback(() => {
    return cartItems
      .reduce((total, item) => {
        const discountedPrice = item.price - item.price * (item.discount / 100);
        return total + discountedPrice * item.quantity;
      }, 0)
      .toFixed(2);
  }, [cartItems]);
  
  const redirectToCheckOutPage=()=>{
    navigate("/checkout")
    

  }

  const handleRemoveItem = async (cartId) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteCartItem,
        data: {
          _id: cartId,
        },
      });

      if (response.data.success) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.cartId !== cartId)
        );
        toast.dismiss();
        toast.success("Item removed from cart");
        
      }
    } catch (error) {
      toast.error("Failed to Remove")

    }
  };

  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await Axios({
        ...SummaryApi.updateCartItemQty,
        data: {
          _id: cartId,
          qty: newQuantity,
        },
      });

      if (response.data.success) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.cartId === cartId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        showCart ? "translate-x-0" : "translate-x-full"
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Your Cart ({cartItems.length})
          </h2>
          <button
            onClick={() => setShowCart(false)}
            className="text-gray-400 hover:text-white"
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-400 mt-4">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex p-2 bg-gray-700 rounded-lg items-center"
                >
                  <img
                    src={item.image[0]}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    loading="lazy"
                  />
                  <div className="ml-3 flex flex-col flex-grow">
                    <h3 className="text-white font-medium truncate">
                      {item.name.length > 20
                        ? `${item.name.slice(0, 19)}...`
                        : item.name}
                    </h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-indigo-400 font-bold">
                        ₹
                        {(
                          item.price -
                          item.price * (item.discount / 100)
                        ).toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.cartId, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-gray-600 rounded text-white"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-white">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.cartId, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-600 rounded text-white"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.cartId)}
                    className="text-red-400 hover:text-red-300 ml-2"
                    aria-label="Remove item"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-white mb-4">
              <span className="font-bold">Total:</span>
              <span className="font-bold">₹{calculateTotal()}</span>
            </div>
            <button
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
              aria-label="Proceed to checkout"
              onClick={redirectToCheckOutPage}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
