import {Router} from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getAllOrdersAdmin, getOrderDetails, getUserOrders, OnlinePaymentOrderController, PaymentFailed, UpdateOrderStatus, VerifyPayment } from '../controllers/order.controller.js'
import { adminCheck } from '../middleware/admin.auth.js'


const orderRouter=Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.get('/getuserOrder',auth,getUserOrders)
orderRouter.get('/getorderdetail/:orderId',auth,getOrderDetails)
orderRouter.get('/getallorders',auth,adminCheck,getAllOrdersAdmin)
orderRouter.put('/updateorderstatus/:orderId',auth,adminCheck,UpdateOrderStatus)
orderRouter.post('/online-payment',auth,OnlinePaymentOrderController)
orderRouter.post('/verify-payment',auth,VerifyPayment)
orderRouter.post('/payment-failed',auth,PaymentFailed)

export default orderRouter