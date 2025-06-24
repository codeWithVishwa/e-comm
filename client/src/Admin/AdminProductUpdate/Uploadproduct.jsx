import React, { useState, useRef, useEffect } from "react";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import UploadImage from "../../utils/UploadImage";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import { ToastContainer, toast } from "react-toastify";
import successAlert from "../../utils/SuccessAlert";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


export const Uploadproduct = () => {
  const navigate=useNavigate()
  const user=useSelector((state)=>state.user)
  useEffect(()=>{
    if(!user){
      navigate('/login')
      return;
    }
    if(user?.role!=="ADMIN"){
      navigate("/account")
      return;
    }
  },[])
  const [data, setData] = useState({
    name: "",
    image: [], // stores single uploaded image URL in array
    unit: "",
    stock: "",
    price: "",
    discount: "",
    rating: "",
    description: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]); // max one item
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
 

  // Clean up object URLs on unmount or change
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview.preview) URL.revokeObjectURL(preview.preview);
      });
    };
  }, [imagePreviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // If there's already an image, don't proceed
    if (imagePreviews.length > 0) {
      alert("Please remove the current image before uploading a new one");
      e.target.value = ""; // Clear the file input
      return;
    }

    // Revoke previous previews to avoid memory leaks
    imagePreviews.forEach((prev) => {
      if (prev.preview) URL.revokeObjectURL(prev.preview);
    });

    setIsUploading(true);

    const preview = URL.createObjectURL(file);
    const newImage = {
      file,
      preview,
      name: file.name,
      isUploading: true,
      url: null,
    };

    // Set preview immediately (only one)
    setImagePreviews([newImage]);

    try {
      const response = await UploadImage([file]);
      const uploadedUrl = response.data?.url; // get first URL


      if (uploadedUrl) {
        setImagePreviews([
          {
            ...newImage,
            isUploading: false,
            url: uploadedUrl,
          },
        ]);

        setData((prev) => ({
          ...prev,
          image: [uploadedUrl], // store single url
        }));
      }
    } catch (error) {
      console.error("Upload failed for", file.name);
      setImagePreviews([]);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Clear the file input after processing
    }
  };

  const removeImage = () => {
    imagePreviews.forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });

    setImagePreviews([]);
    setData((prev) => ({
      ...prev,
      image: [],
    }));

    // Clear the file input when removing image
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    // Don't allow triggering if there's already an image
    if (imagePreviews.length > 0) {
      alert("Please remove the current image before uploading a new one");
      return;
    }
    fileInputRef.current.click();
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    try {
      const response=await Axios({
        ...SummaryApi.createProduct,
        data:data
      })
      const {data:responseData}=response
      if(responseData.success){
        successAlert(responseData.message)
        navigate('/admin/productsEdit')

      }


    } catch (error) {
      toast.dismiss()
      toast.error(error.message||error )
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 p-4 md:p-8">
      <ToastContainer theme="colored" />
      <div className="max-w-4xl mx-auto bg-gray-700 rounded-lg shadow-md p-6 mt-16">
        <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-indigo-300 mb-6 pt-1">
          Upload Product
        </h1>
          <button className="text-base text-blue-500" onClick={()=>{
            navigate("/admin/productsEdit")
          }}>Go Back</button>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium text-white/80">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter product name"
              value={data.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-white/80"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter product description"
              value={data.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-white"
            />
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80">
              Product Image
            </label>

            {imagePreviews.length > 0 && (
              <div className="relative group w-32 h-32 mb-4">
                {imagePreviews[0].isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-600 rounded-md">
                    <span className="text-white text-sm">Uploading...</span>
                  </div>
                ) : (
                  <img
                    src={imagePreviews[0].url || imagePreviews[0].preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md border border-gray-500"
                  />
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MdDelete size={16} />
                </button>
                <p className="text-xs text-gray-300 truncate mt-1">
                  {imagePreviews[0].name}
                </p>
              </div>
            )}

            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-500 rounded-md p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <MdCloudUpload size={48} className="text-gray-400" />
                <p className="text-sm text-gray-300">
                  {isUploading
                    ? "Uploading..."
                    : imagePreviews.length > 0
                    ? "Image uploaded (click remove to change)"
                    : "Click to upload an image"}
                </p>
                <p className="text-xs text-gray-400">
                  Supports JPG, PNG up to 5MB
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                disabled={isUploading || imagePreviews.length > 0}
              />
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unit */}
            <div className="grid gap-2">
              <label
                htmlFor="unit"
                className="text-sm font-medium text-white/80"
              >
                Unit
              </label>
              <input
                type="text"
                id="unit"
                name="unit"
                placeholder="e.g. kg, piece, etc."
                value={data.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
            </div>

            {/* Stock */}
            <div className="grid gap-2">
              <label
                htmlFor="stock"
                className="text-sm font-medium text-white/80"
              >
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                placeholder="Available quantity"
                value={data.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <label
                htmlFor="price"
                className="text-sm font-medium text-white/80"
              >
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="Product price"
                value={data.price}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
            </div>

            {/* Discount */}
            <div className="grid gap-2">
              <label
                htmlFor="discount"
                className="text-sm font-medium text-white/80"
              >
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                placeholder="Discount percentage"
                value={data.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
            </div>
          </div>
          {/* Rating */}
          <div className="grid gap-2">
            <label
              htmlFor="rating"
              className="text-sm font-medium text-white/80"
            >
              Rating
            </label>
            <select
              id="rating"
              name="rating"
              value={data.rating}
              onChange={handleChange}
              className="
                      w-full px-4 py-3          
                     bg-gray-600 border border-gray-500 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     text-white text-base       
                     appearance-none            
                     cursor-pointer             
                     hover:bg-gray-500         
                      transition-colors         
                      md:py-2"
            >
              <option value="" disabled hidden>
                Select a rating
              </option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option
                  key={num}
                  value={num}
                  className="bg-gray-700 hover:bg-gray-600" /* Optional: Style dropdown options */
                >
                  {num} ⭐ {/* Optional: Add star emoji for visual feedback */}
                </option>
              ))}
            </select>
          </div>
          {/* Submit */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={isUploading}
            >
              {isUploading ? "Processing..." : "Upload Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Uploadproduct
