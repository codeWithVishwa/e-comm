import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Account } from "./components/Account";
import { Register } from "./pages/Register";
import { ForgotPass } from "./pages/ForgotPass";
import { OtpVerification } from "./pages/OtpVerification";
import { ResetPassword } from "./pages/ResetPassword";
import fetchUserDetails from "./utils/fetchUserDetails";
import React, { useEffect } from "react";
import { setUserDetails } from "./store/userSlice";
import { useDispatch } from "react-redux";
import { Myorder } from "./pages/Myorder";
import UserProfileAvatarEdit from "./components/userProfileAvatarEdit";
import { UpdateDetail } from "./components/UpdataDetail";
import { Unknown } from "./components/Unknown";
import { AdminDashboard } from "./Admin/Admin";
import ProductsEdit from "./Admin/AdminProductUpdate/ProductsEdit";
import Uploadproduct from "./Admin/AdminProductUpdate/UploadProduct";
import EditProduct from "./Admin/AdminProductUpdate/EditProduct";
import Products from "./pages/Products";
import Safetytips from "./pages/Safetytips";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import { CheckoutPage } from "./pages/CheckoutPage";
import { Address } from "./pages/Address";
import { OrderDetail } from "./pages/OrderDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from 'react-router-dom';

import { AdminOrders } from "./Admin/AdminOrders/AdminOrders";
import AdminMsg from "./Admin/AdminMessage/AdminMsg";
import { AdminUserManagement } from "./Admin/AdminUsers/AdminUserManagement";
import useActivityTracker from "./hooks/useActivityTracker";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsAndCondition } from "./pages/TermsAndCondition";
import { RefundPolicy } from "./pages/RefundPolicy";

function App() {
 
  const location = useLocation();

  const dispatch = useDispatch();
   useActivityTracker()

  const fetchUser = async () => {
    const userData = await fetchUserDetails();
    dispatch(setUserDetails(userData.data));
  };

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      fetchUser();
    }
  }, []);

  return (
    <div className="h-screen">
      <Navbar />
      <ToastContainer theme="dark" limit={3} key={location.pathname} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/safetytips" element={<Safetytips />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/productDetail/:id" element={<ProductDetail />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy/>}/>
        <Route path="/terms" element={<TermsAndCondition/>}/>
        <Route path="/refundpolicy" element={<RefundPolicy/>}/>
        <Route path="/myorder" element={<Myorder />} />
        <Route path="/order/:orderId" element={<OrderDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPass />} />
        <Route path="/otpverification" element={<OtpVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account" element={<Account />} />
        <Route path="/myorder" element={<Myorder />} />
        <Route path="/updateAvatar" element={<UserProfileAvatarEdit />} />
        <Route path="/updateUserDetail" element={<UpdateDetail />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/Uploadproduct" element={<Uploadproduct />} />
        <Route path="/admin/productsEdit" element={<ProductsEdit />} />
        <Route
          path="/admin/edit-product/:productId"
          element={<EditProduct />}
        />
        <Route path="/admin/users" element={<AdminUserManagement/>}/>
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/message" element={<AdminMsg/>}/>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/address" element={<Address />} />

        <Route path="*" element={<Unknown />} />
      </Routes>
      
    </div>
  );
}

export default App;
