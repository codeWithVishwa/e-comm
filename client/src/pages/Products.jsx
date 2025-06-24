import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cart from "./Cart";
import { Footer } from "../components/Footer";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputref = useRef();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Calculate price with discount
  const calculatePrice = useCallback((price, discount, quantity) => {
    const discountedPrice = price - price * (discount / 100);
    return (discountedPrice * quantity).toFixed(2);
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
        },
      });

      if (response.data.success) {
        const productsWithQuantity = response.data.data.map((product) => ({
          ...product,
          quantity: 1,
        }));
        setProducts(productsWithQuantity);
        setPagination((prev) => ({
          ...prev,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages,
        }));
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  const fetchCartItem = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCartItem,
      });
      if (response.data.success) {
        const formattedCartItems = response.data.data.map((cartItem) => ({
          ...cartItem.productId,
          cartId: cartItem._id,
          quantity: cartItem.quantity,
        }));
        setCartItems(formattedCartItems);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch cart items"
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItem();
  }, [fetchProducts]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  // Add to cart function
  const handleAddToCart = useCallback(
    async (product) => {
      try {
        const response = await Axios({
          ...SummaryApi.addToCart,
          data: {
            productId: product._id,
            quantity: product.quantity,
          },
        });
        if (response.data.success) {
          toast.dismiss();
          toast.success(`${product.name} added to cart`);
          fetchCartItem();
        }
      } catch (error) {
        toast.error(error);
      }
    },
    [fetchCartItem]
  );

  // Quantity handlers
  const handleIncreaseQuantity = useCallback((productId) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === productId
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  }, []);

  const handleDecreaseQuantity = useCallback((productId) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === productId && product.quantity > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  }, []);

  // Pagination
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage > 0 && newPage <= pagination.totalPages) {
        setPagination((prev) => ({ ...prev, page: newPage }));
      }
    },
    [pagination.totalPages]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    inputref.current?.focus();
  }, []);

  if (loading && pagination.page === 1) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-18">
        {/* Header with Search and Cart */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            <span className="text-indigo-600">Our</span> Products
          </h1>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <form onSubmit={(e) => e.preventDefault()} className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchInput}
                  ref={inputref}
                  autoFocus
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setIsSearching(true);
                  }}
                  className="w-full pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search products"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {(searchInput || isSearching) && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                    aria-label="Clear search"
                  >
                    {isSearching ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    ) : (
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </form>

            <button
              onClick={() => setShowCart(true)}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 animate-bounce"
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
              Cart ({cartItems.length})
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden group">
                    <img
                      src={
                        product.image[0] || "https://via.placeholder.com/300"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-white mb-2 truncate">
                      {product.name}
                    </h2>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <p
                      className={`text-sm mb-3 line-clamp-2 ${
                        product.stock === 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {product.stock === 0
                        ? "Out of stock"
                        : `Stock : ${product.stock}`}
                    </p>

                    {/* Price Section */}
                    <div className="mb-3">
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-white">
                          ₹{calculatePrice(product.price, product.discount, 1)}
                        </span>
                        {product.discount > 0 && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            ₹{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center border border-gray-600 rounded-md bg-gray-700">
                        <button
                          onClick={() => handleDecreaseQuantity(product._id)}
                          className="px-3 py-1 text-gray-300 hover:bg-gray-600 disabled:opacity-30"
                          disabled={product.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-white">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(product._id)}
                          className="px-3 py-1 text-gray-300 hover:bg-gray-600"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-lg font-bold text-white">
                        ₹
                        {calculatePrice(
                          product.price,
                          product.discount,
                          product.quantity
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                        onClick={() =>
                          navigate(`/productDetail/${product._id}`)
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1 animate-pulse"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </button>

                      <button
                        className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                        onClick={() => handleAddToCart(product)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1 animate-bounce"
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
                        Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 flex items-center"
                  aria-label="Previous page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Prev
                </button>
                {[...Array(pagination.totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => handlePageChange(num + 1)}
                    className={`px-4 py-2 border-t border-b border-gray-700 ${
                      pagination.page === num + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                    aria-label={`Page ${num + 1}`}
                  >
                    {num + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 flex items-center"
                  aria-label="Next page"
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No products found</p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-4 text-indigo-500 hover:text-indigo-400"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cart Component */}
      <Cart
        cartItems={cartItems}
        setCartItems={setCartItems}
        showCart={showCart}
        setShowCart={setShowCart}
      />

      <Footer/>
      
    </div>
    
  );
};

export default Products;
