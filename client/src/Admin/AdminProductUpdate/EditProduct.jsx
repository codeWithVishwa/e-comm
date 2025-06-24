import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import successAlert from "../../utils/SuccessAlert";
import { useSelector } from "react-redux";

const EditProduct = () => {
  const user=useSelector((state)=>state.user)

  useEffect(()=>{
    if(!user){
      navigate('/login')
      return;
    }
    if(user?.role!=="ADMIN"){
      navigate('/account')
      return;

    }
  },[user])
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    unit: "",
    rating: 0,
    image: [],
  });

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getSingleProduct,
        url: SummaryApi.getSingleProduct.url.replace(":productId", productId),
      });

      if (response.data.success) {
        const product = response.data.data;
        setProductData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          discount: product.discount || "",
          stock: product.stock || "",
          unit: product.unit || "",
          rating: product.rating || 0,
          image: product.image || [],
        });
        setImagePreviews(product.image || []);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    if (index < productData.image.length) {
      setProductData((prev) => ({
        ...prev,
        image: prev.image.filter((_, i) => i !== index),
      }));
    } else {
      const newImages = [...images];
      const adjustedIndex = index - productData.image.length;
      newImages.splice(adjustedIndex, 1);
      setImages(newImages);
    }
  };

  const uploadImages = async () => {
    if (images.length === 0) return [];

    const formData = new FormData();
    images.forEach((image) => {
      formData.append("files", image);
    });

    try {
      const response = await Axios({
        ...SummaryApi.uploadImage,
        data: formData,
      });
      return response.data.data || [];
    } catch (error) {
      toast.error("Failed to upload images");
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const uploadedImages = await uploadImages();
      const allImages = [...productData.image, ...uploadedImages];

      const payload = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        discount: Number(productData.discount || 0),
        stock: Number(productData.stock),
        unit: productData.unit,
        rating: Number(productData.rating),
        image: allImages,
      };

      const response = await Axios({
        ...SummaryApi.updateProduct,
        url: SummaryApi.updateProduct.url.replace(":productId", productId),
        data: payload,
      });

      if (response.data.success) {
        successAlert("Product updated successfully!");
        navigate("/admin/productsEdit");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto mt-20">
        <h1 className="text-3xl font-bold text-indigo-300 mb-6">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Price (Rs)</label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={productData.discount}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={productData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Unit</label>
              <input
                type="text"
                name="unit"
                value={productData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., kg, g, lb, etc."
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Rating (1-5)</label>
              <input
                type="number"
                name="rating"
                value={productData.rating}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Product Images</label>
            <div className="flex flex-wrap gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              onChange={handleImageChange}
              className="block w-full text-gray-400"
              multiple
              accept="image/*"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/productsEdit")}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;