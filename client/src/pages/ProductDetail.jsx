import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast, ToastContainer } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCart,setShowCart]=useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await Axios({
          ...SummaryApi.getSingleProduct,
          url: SummaryApi.getSingleProduct.url.replace(":productId", id),
        });

        if (response.data.success) {
          setProduct(response.data.data);
        }
      } catch (error) {
        toast.dismiss();
        toast.error(error.response?.data?.message || "Failed to fetch product");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart =async () => {
    try {
       const response=await Axios({
        ...SummaryApi.addToCart,
        data:{
          productId:product._id,
          quantity:product.quantity
        }
      })
      if(response.data.success){
        toast.dismiss()
        toast.success(`${product.name} added to cart`)
      }
    } catch (error) {
      
      
    }
    
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Product not found</p>
      </div>
    );
  }

  const discountedPrice =
    product.price - product.price * (product.discount / 100);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer theme="dark" />
      <div className="max-w-7xl mx-auto mt-14">
        <button
          onClick={() => navigate("/products")}
          className="mb-6 flex items-center text-blue-400 hover:text-blue-300"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Products
        </button>
         

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
              <img
                src={
                  product.image[selectedImage] ||
                  "https://via.placeholder.com/600"
                }
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.image.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden ${
                    selectedImage === index
                      ? "ring-2 ring-blue-500"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img || "https://via.placeholder.com/100"}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {product.discount > 0 && (
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-red-400 mr-3">
                  ₹{discountedPrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="ml-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              </div>
            )}
            {product.discount === 0 && (
              <div className="text-2xl font-bold mb-4">
                ₹{product.price.toFixed(2)}
              </div>
            )}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-200 mb-2">Unit</h2>
              <span className="inline-block px-2 py-1 text-sm text-white bg-gray-600 rounded shadow-sm min-w-[2rem] text-center">
                {product.unit}
              </span>
            </div>

            <div className="mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < product.rating ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-300">{product.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Details</h2>
              <ul className="text-gray-300 space-y-1">
                {product.details &&
                  Object.entries(product.details).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="flex items-center mb-8">
              <div className="flex items-center border border-gray-600 rounded-md bg-gray-700 mr-4">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1 text-gray-300 hover:bg-gray-600"
                >
                  -
                </button>
                <span className="px-3 py-1 text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 py-1 text-gray-300 hover:bg-gray-600"
                >
                  +
                </button>
              </div>
              <div className="text-xl font-bold">
                ₹{(discountedPrice * quantity).toFixed(2)}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
                Add to Cart
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium transition-colors">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
