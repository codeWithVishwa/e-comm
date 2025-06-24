import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {  // Add this new field
      type: String,
      unique: true,
      default: function() {
        return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      }
    },
    
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },

    product_details: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: 'product',
          required: true,
        },
        name: String,
        image: [String],
        price: Number,
        quantity: Number,
        discount: Number,
      },
    ],

    paymentId: {
      type: String,
      default: '',
    },
    paymentDetails:{
      type:Object,
      default:{
      paymentId:'',
      paymentMethod:'',
      paymentDate: Date,
      signature: '',
      status: 'Pending',
      currency: 'INR'
      },
    },
    

    paymentStatus: {
      type: String,
      default: 'pending',
    },

    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: 'address',
      required: true,
    },

    subTotalAmt: {
      type: Number,
      default: 0,
    },

    totalAmt: {
      type: Number,
      default: 0,
    },

    invoice_receipt: {
      type: String,
      default: '',
    },
    orderStatus:{
      type:String,
      default:'PENDING'
    },
    razorpayOrderId:{
      type:String,
      default:''
    }
  },
 
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model('order', orderSchema);

export default OrderModel;
