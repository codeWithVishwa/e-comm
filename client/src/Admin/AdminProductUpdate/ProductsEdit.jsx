import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import successAlert from "../../utils/SuccessAlert";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";




const ProductsEdit = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    useEffect(()=>{
      if(!user){
        navigate("/login")
        return;
        
      }
      if(user?.role!=="ADMIN"){
        navigate('/account')
        return;

      }
    },[user])
  

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async (page = 1, query = "") => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page,
          limit: 10,
          search: query,
        },
      });
      setProducts(response.data.data); 
      setTotalPages(response.data.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      toast.error(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await Axios({
          ...SummaryApi.deleteProduct,
          url: SummaryApi.deleteProduct.url.replace(":productId", productId),
        });
        if (response.data.success) {
          successAlert(response.data.message);
          fetchProducts(currentPage, searchQuery);
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete product");
      }
    }
  };

  const handleEdit = (productId) => {
      navigate(`/admin/edit-product/${productId}`);

  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1, searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-300">Product Management</h1>
          <button
            onClick={() => navigate("/admin/Uploadproduct")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 transition-colors duration-200"
          >
            <FiPlus /> Add Product
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </form>

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (products || []).length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No products found. Add a new product to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-gray-700 rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-600">
                  <tr>
                    {["Image", "Name", "Price", "Stock", "Unit", "Rating", "Actions"].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-700 divide-y divide-gray-600">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-600 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.image && product.image.length > 0 ? (
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center">
                            <span className="text-xs text-gray-300">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        Rs: {product.price}
                        {product.discount > 0 && (
                          <span className="ml-2 text-xs text-green-400">
                            ({product.discount}% off)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.unit && (
                          <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">
                            {product.unit}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${i < product.rating ? "text-yellow-400" : "text-gray-400"}`}
                          >
                            ★
                          </span>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product._id)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => fetchProducts(page, searchQuery)}
                      className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsEdit;
