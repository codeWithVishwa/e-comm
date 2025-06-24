


export const baseURL = "http://localhost:8080";

const SummaryApi = {
    register: {
        url: "/api/v1/user/register",
        method: "post",
    },
    verifyEmail: {
        url: "/api/v1/user/verify-email",
        method: "post",
    },
    login: {
        url: "/api/v1/user/login",
        method: "post",
    },
    logout: {
        url: "/api/v1/user/logout",
        method: "get",
    },
    uploadAvatar: {
        url: "/api/v1/user/upload-avatar",
        method: "put",
    },
    updateUser: {
        url: "/api/v1/user/update-user",
        method: "put",
    },
    forgotPassword: {
        url: "/api/v1/user/forgot-password",
        method: "put",
    },
    verifyForgotPasswordOtp: {
        url: "/api/v1/user/verify-forgot-password-otp",
        method: "put",
    },
    resetPassword: {
        url: "/api/v1/user/reset-password",
        method: "put",
    },
    refreshToken: {
        url: "/api/v1/user/refresh-token",
        method: "post",
    },
    userDetails: {
        url: "/api/v1/user/userdetails",
        method: "get",
    },
    uploadImage:{
        url:"/api/v1/file/upload",
        method:"post"
    },
    updateActivity:{
        url:"/api/v1/user/update-last-active",
        method:"patch"
    },
    createProduct:{
        url:"/api/v1/product/create",
        method:"post"
    },
    getProduct:{
        url:"/api/v1/product/get",
        method:"post"
    },
    updateProduct:{
        url:"/api/v1/product/:productId",
        method:"put"
    },
    deleteProduct:{
        url:"/api/v1/product/:productId",
        method:"delete"
    },
    getSingleProduct:{
        url:"/api/v1/product/single/:productId",
        method:"put"
    },
    addToCart:{
        url:"/api/v1/cart/create",
        method:"post"
    },
    getCartItem:{
        url:"/api/v1/cart/get",
        method:"get"
    },
    updateCartItemQty:{
        url:"/api/v1/cart/update-qty",
        method:"put"
    },
    deleteCartItem:{
        url:"/api/v1/cart/delete",
        method:"delete"
    },
    createAddress:{
        url:"/api/v1/address/create",
        method:"post"
    },
    getUserAddress:{
        url:"/api/v1/address/get",
        method:"get"
    },
    deleteUserAddress:{
        url:"/api/v1/address/delete/:addressId",
        method:"delete"
    },
    cashOnDelivery:{
        url:"/api/v1/order/cash-on-delivery",
        method:"post"
    },
    getUserOrders:{
        url:"/api/v1/order/getuserOrder",
        method:"get"
    },
    getOrderDetail:{
        url:"/api/v1/order/getorderdetail/:orderId",
        method:"get"
    },
    getAdminOrder:{
        url:"/api/v1/order/getallorders?",
        method:"get"
    },
    updateOrderStatus:{
        url:"/api/v1/order/updateorderstatus/:orderId",
        method:"put"
    },
    onlinePayment:{
        url:"/api/v1/order/online-payment",
        method:"post"
    },
    verifyPayment:{
        url:"/api/v1/order/verify-payment",
        method:"post"
    },
    paymentFailed:{
        url:"/api/orders/payment-failed",
        method:"post"

    },
    sendMessage:{
        url:"/api/v1/message/send",
        method:"post"
    },
    getMessage:{
        url:"/api/v1/message/get",
        method:"get"
    },
    updateMessageStatus:{
        url:"/api/v1/message/update-status/:messageId",
        method:"patch"
    },
    deleteMessage:{
        url:"/api/v1/message/delete/:messageId",
        method:"delete"
    },
    adminGetAllUsers:{
        url:"/api/v1/admin/users",
        method:"get"
    },
    getUserDetailedData:{
        url:"/api/v1/admin/users/:userId",
        method:"get"
    },
    adminUpdateUserStatus:{
        url:"/api/v1/admin/users/:userId/status",
        method:"put"

    },
    onlinePayment:{
        url:"/api/v1/order/online-payment",
        method:"post"
    },
    verifyPayment:{
        url:"/api/v1/order/verify-payment",
        method:"post"
    },
    paymentFailed:{
        url:"/api/v1/order/payment-failed",
        method:"post"
    }
    
}

export default SummaryApi