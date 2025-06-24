import mongoose from 'mongoose';
import OrderModel from '../models/order.model.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import AddressModel from '../models/address.model.js';
import CartProductModel from '../models/cartproduct.model.js'
import Razorpay from 'razorpay';
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET){
  throw new Error('Razorpay credentials are not configured in environment variables')
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const ORDER_CONFIG = {
  MIN_AMOUNT: 200, // 1 INR minimum
  CURRENCY: 'INR',
  PAYMENT_CAPTURE: 1 // Auto-capture payments
};


export const CashOnDeliveryOrderController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction()
  try {
    const userId = req.userId;
    const { product_details, delivery_address, totalAmt, subTotalAmt } = req.body;

    // Validate required fields - fixed the condition (removed commas)
    if (!product_details || !delivery_address || !totalAmt || !subTotalAmt) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: product_details, delivery_address, totalAmt, subTotalAmt',
      });
    }

    // Validate product_details array
    if (!Array.isArray(product_details) || product_details.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product details',
      });
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify address exists
    const address = await AddressModel.findOne({
      _id: delivery_address,
      userId
    });

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery address',
      });
    }

    // Verify products and stock availability
    const productVerification = await Promise.all(
      product_details.map(async (item) => {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        return {
          ...item,
          currentPrice: product.price,
          currentDiscount: product.discount,
          currentStock: product.stock
        };
      })
    );

    // Calculate expected total to prevent tampering
    const calculatedTotal = productVerification.reduce((total, item) => {
      const discountedPrice = item.currentPrice - (item.currentPrice * item.currentDiscount / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - totalAmt) > 0.01) { // Allow for rounding differences
      return res.status(400).json({
        success: false,
        message: 'Order total does not match calculated amount',
      });
    }

    // Update product stocks
    await Promise.all(
      productVerification.map(async (item) => {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      })
    );

    // Create new order with complete product details
    const newOrder = new OrderModel({
      userId,
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generate unique order ID
      product_details: productVerification.map(item => ({
        productId: item.productId,
        name: item.name || '', // Fallback if name not provided
        image: item.image || [], // Fallback if image not provided
        price: item.currentPrice,
        quantity: item.quantity,
        discount: item.currentDiscount,
        purchasedPrice: item.currentPrice - (item.currentPrice * item.currentDiscount / 100)
      })),
      delivery_address: delivery_address,
      totalAmt,
      subTotalAmt,
      
      paymentDetails:{
        paymentMethod: 'cod',

      },
      paymentStatus: 'pending',
      orderStatus: 'PROCESSING'
    });

    const savedOrder = await newOrder.save();

    // Update user's order history
    await UserModel.findByIdAndUpdate(userId, {
      $push: { orders: savedOrder._id },
    });
    // Clear user's cart
    await CartProductModel.deleteMany({ userId }).session(session);
    await UserModel.findByIdAndUpdate(
      userId,
      { shopping_cart: [] },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'COD Order placed successfully',
      data: {
        orderId: savedOrder.orderId,
        _id: savedOrder._id,
        totalAmount: savedOrder.totalAmt,
        status: savedOrder.orderStatus,
        createdAt: savedOrder.createdAt
      },
    });


  } catch (error) {
    console.error('COD Order Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to place COD order',
    });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.userId;

    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
    })
      .populate({
        path: 'product_details.productId',
        select: 'name images category' // Only populate specific fields
      })
      .populate({
        path: 'delivery_address',
        select: 'name address_line city state pincode mobile isDefault'
      })
      .lean(); // Convert to plain JavaScript object

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Format response data
    const formattedOrder = {
      ...order,
      product_details: order.product_details.map(item => ({
        ...item,
        productId: undefined, // Remove duplicate ID
        product: item.productId, // Rename populated product
        totalPrice: (item.price - (item.price * item.discount / 100)) * item.quantity
      })),
      delivery_address: order.delivery_address || null
    };

    return res.status(200).json({
      success: true,
      data: formattedOrder,
    });
  } catch (error) {
    console.error('Order Details Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order details',
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('orderId totalAmt orderStatus paymentMethod createdAt')
      .lean();

    const totalOrders = await OrderModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalOrders / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user orders',
    });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId, orderId } = req.query;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
      });
    }

    // Build query
    const query = {};
    if (status) {
      query.orderStatus = status;
    }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format',
        });
      }
      query.userId = userId;
    }

    // Get orders with all necessary populated data
    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'userId',
        select: 'name email phone'
      })
      .populate({
        path: 'product_details.productId',
        select: 'name price images'
      })
      .populate({
        path: 'delivery_address',
        select: 'name address_line city state country pincode mobile alternatePhone'
      })
      .lean();

    const totalOrders = await OrderModel.countDocuments(query);

    // Format response
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: order.orderId,
      user: order.userId ? {
        _id: order.userId._id,
        name: order.userId.name,
        email: order.userId.email,
        phone: order.userId.phone
      } : null,
      products: order.product_details.map(item => ({
        name: item.productId?.name || item.name,
        image: item.productId?.images?.[0] || item.image?.[0],
        price: item.price,
        quantity: item.quantity,
        total: (item.price - (item.price * item.discount / 100)) * item.quantity
      })),
      deliveryAddress: order.delivery_address ? {
        recipient: order.delivery_address.name,
        address: {
          line: order.delivery_address.address_line,
          city: order.delivery_address.city,
          state: order.delivery_address.state,
          country: order.delivery_address.country,
          pincode: order.delivery_address.pincode
        },
        contact: {
          mobile: order.delivery_address.mobile,
          alternatePhone: order.delivery_address.alternatePhone
        }
      } : null,
      totalAmount: order.totalAmt,
      status: order.orderStatus,
      paymentMethod: order.paymentDetails.paymentMethod,
      paymentStatus:order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt

    }));

    return res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalOrders / limit),
          hasNextPage: (page * limit) < totalOrders,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Admin Get All Orders Error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format in request',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const UpdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.userId; // Assuming this is set by your auth middleware

    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
        error: true
      });
    }

    // Validate status input
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Valid values are: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED',
        error: true
      });
    }

    // Find and update the order
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { _id: orderId },
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: true
      });
    }

    // Optionally: Add status change to order history
    // await OrderModel.findByIdAndUpdate(orderId, {
    //   $push: { statusHistory: { status, changedBy: userId, changedAt: new Date() } }
    // });

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: updatedOrder._id,
        newStatus: updatedOrder.status,
        previousStatus: updatedOrder.previousStatus // If you track this
      },
      error: false
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status',
      error: true
    });
  }
};

export const OnlinePaymentOrderController = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();
    const userId = req.userId;
    const { product_details, delivery_address, totalAmt, subTotalAmt } = req.body;

    // Validation
    const validationErrors = [];
    if (!product_details?.length) validationErrors.push('Product details are required');
    if (!delivery_address) validationErrors.push('Delivery address is required');
    if (!totalAmt) validationErrors.push('Total amount is required');
    if (!subTotalAmt) validationErrors.push('Subtotal amount is required');

    if (validationErrors.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const amountInPaise = Math.round(totalAmt * 100);
    if (amountInPaise < ORDER_CONFIG.MIN_AMOUNT * 100) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Amount must be at least ₹${ORDER_CONFIG.MIN_AMOUNT}`,
      });
    }

    // Verify user
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Verify address
    const address = await AddressModel.findOne({ _id: delivery_address, userId }).session(session);
    if (!address) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive delivery address',
      });
    }

    // Verify product availability
    const productVerification = await Promise.all(
      product_details.map(async (item) => {
        const product = await ProductModel.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Only ${product.stock} items available for ${product.name}`);
        }
        return {
          ...item,
          currentPrice: product.price,
          currentDiscount: product.discount,
        };
      })
    );

    // Create Razorpay order
    let razorpayOrder;
    try {
      const razorpayOrderOptions = {
        amount: amountInPaise,
        currency: ORDER_CONFIG.CURRENCY,
        receipt: `order_${Date.now()}`,
        payment_capture: ORDER_CONFIG.PAYMENT_CAPTURE,
        notes: {
          userId: userId.toString(),
          platform: 'ecommerce',
        },
      };

      razorpayOrder = await Promise.race([
        razorpay.orders.create(razorpayOrderOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Razorpay API timeout')), 10000)
        ),
      ]);
    } catch (razorpayError) {
      await session.abortTransaction();
      session.endSession();

      console.error('Razorpay Order Creation Error:', {
        error: razorpayError.error || razorpayError.message,
        code: razorpayError.statusCode,
        userId,
        amount: amountInPaise,
      });

      let userMessage = 'Payment gateway error';
      if (razorpayError.message.includes('timeout')) {
        userMessage = 'Payment service is temporarily unavailable';
      } else if (razorpayError.error?.description) {
        userMessage = razorpayError.error.description;
      }

      return res.status(500).json({
        success: false,
        message: userMessage,
        errorCode: razorpayError.statusCode || 'RAZORPAY_ERROR',
      });
    }

    // Create order in DB
    const newOrder = new OrderModel({
      userId,
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product_details: productVerification.map((item) => ({
        productId: item.productId,
        name: item.name || '',
        image: item.image || [],
        price: item.currentPrice,
        quantity: item.quantity,
        discount: item.currentDiscount,
        purchasedPrice: item.currentPrice - (item.currentPrice * item.currentDiscount) / 100,
      })),
      delivery_address,
      totalAmt,
      subTotalAmt,
      paymentMethod: 'online',
      paymentStatus: 'pending',
      orderStatus: 'PENDING_PAYMENT',
      razorpayOrderId: razorpayOrder.id,
      paymentGateway: 'razorpay',
    });

    const savedOrder = await newOrder.save({ session });

    // Update user's order list
    await UserModel.findByIdAndUpdate(
      userId,
      { $push: { orders: savedOrder._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Send response
    const response = {
      orderId: savedOrder._id,
      razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
      customer: {
        name: user.name,
        email: user.email,
        contact: user.phone || '',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: response,
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error('Transaction abort failed:', abortError);
    } finally {
      session.endSession();
    }

    console.error('Order Processing Error:', {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
      time: new Date().toISOString(),
      requestBody: req.body,
    });

    let userMessage = 'An unexpected error occurred while processing your payment';
    let statusCode = 500;

    if (error.message.includes('Product')||error.message.includes('Only')) {
      userMessage = error.message;
      statusCode = 400;
    } else if (error.name === 'ValidationError') {
      userMessage = 'Invalid order data';
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: userMessage,
      ...(process.env.NODE_ENV === 'development' && {
        debugInfo: {
          error: error.message,
          type: error.name,
        },
      }),
    });
  }
};

export const VerifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.userId;

    // 1. Enhanced Input Validation
    const missingParams = [];
    if (!razorpay_order_id) missingParams.push('razorpay_order_id');
    if (!razorpay_payment_id) missingParams.push('razorpay_payment_id');
    if (!razorpay_signature) missingParams.push('razorpay_signature');

    if (missingParams.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters',
        missing: missingParams,
        code: 'MISSING_PARAMETERS'
      });
    }

    // 2. Find the Order with proper conditions
    const order = await OrderModel.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
      paymentStatus: 'pending',
      orderStatus: 'PENDING_PAYMENT'
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found or already processed',
        details: {
          razorpay_order_id,
          userId,
          paymentStatus: 'pending'
        },
        code: 'ORDER_NOT_FOUND'
      });
    }

    // 3. Verify Payment Signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await session.abortTransaction();
      
      console.error('Signature Verification Failed:', {
        expected: generatedSignature,
        received: razorpay_signature,
        orderId: order._id,
        userId,
        timestamp: new Date()
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - invalid signature',
        code: 'INVALID_SIGNATURE',
        debug: process.env.NODE_ENV === 'development' ? {
          generatedSignature,
          receivedSignature: razorpay_signature
        } : undefined
      });
    }

    // 4. Verify and Update Product Stocks
    const stockUpdates = order.product_details.map(item => 
      ProductModel.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      )
    );

    const updatedProducts = await Promise.all(stockUpdates);
    
    // Check if any product stock went negative
    const outOfStockProducts = updatedProducts.filter(p => p.stock < 0);
    if (outOfStockProducts.length > 0) {
      throw new Error(`Insufficient stock for products: ${outOfStockProducts.map(p => p.name).join(', ')}`);
    }

    // 5. Update Order Status
    order.paymentStatus = 'paid';
    order.orderStatus = 'PROCESSING';
    order.paymentDetails = {
      paymentId: razorpay_payment_id,
      paymentMethod: 'razorpay',
      paymentDate: new Date(),
      signature: razorpay_signature,
      verifiedAt: new Date()
    };

    // Add to status history
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'PROCESSING',
      changedAt: new Date(),
      changedBy: userId || 'system',
      reason: 'Payment verified'
    });

    await order.save({ session });

    // 6. Clear User's Cart
    await CartProductModel.deleteMany({ userId }).session(session);
    await UserModel.findByIdAndUpdate(
      userId,
      { $set: { shopping_cart: [] } },
      { session }
    );

    await session.commitTransaction();

    // 7. Send confirmation (outside transaction)
    try {
      // Implement your email sending or notification logic here
      console.log(`Payment verified for order ${order.orderId}`);
    } catch (notificationError) {
      console.error('Failed to send confirmation:', notificationError);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed',
      data: {
        orderId: order.orderId,
        paymentId: razorpay_payment_id,
        amount: order.totalAmt,
        status: order.orderStatus,
        products: order.product_details.map(p => ({
          productId: p.productId,
          name: p.name,
          quantity: p.quantity,
          price: p.purchasedPrice
        }))
      }
    });

  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error('Failed to abort transaction:', abortError);
    }
    
    console.error('Payment Verification Error:', {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
      timestamp: new Date().toISOString(),
      requestBody: {
        ...req.body,
        razorpay_signature: req.body.razorpay_signature ? '[REDACTED]' : 'missing'
      }
    });

    const statusCode = error.message.includes('Insufficient stock') ? 409 : 500;
    const errorCode = error.code || (statusCode === 409 ? 'INSUFFICIENT_STOCK' : 'VERIFICATION_ERROR');
    
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'An error occurred during payment verification',
      code: errorCode,
      ...(process.env.NODE_ENV === 'development' && {
        errorDetails: error.message
      })
    });
  } finally {
    session.endSession();
  }
};

export const PaymentFailed = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const userId = req.userId;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing order ID'
      });
    }

    // Update order status to reflect payment failure
    const order = await OrderModel.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
        userId,
        paymentStatus: 'pending'
      },
      {
        orderStatus: 'PAYMENT_FAILED',
        paymentStatus: 'failed'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or already processed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order marked as payment failed',
      data: {
        orderId: order.orderId,
        status: order.orderStatus
      }
    });

  } catch (error) {
    console.error('Payment Failed Handler Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment failure'
    });
  }
};
