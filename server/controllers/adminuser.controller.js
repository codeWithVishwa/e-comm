import mongoose from 'mongoose';
import UserModel from '../models/user.model.js';
import OrderModel from '../models/order.model.js';
import AddressModel from '../models/address.model.js';
import ProductModel from '../models/product.model.js';

export const getAllUserDataForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    // Build base query
    let query = {};
    
    // Add search functionality
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get users with pagination
    const users = await UserModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -refreshToken') // Exclude sensitive fields
      .lean();

    // Get additional data for each user
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        // Get user addresses
        const addresses = await AddressModel.find({ userId: user._id })
          .select('name address_line city state pincode mobile isDefault')
          .lean();

        // Get user orders summary
        const orders = await OrderModel.aggregate([
          { $match: { userId: user._id } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$totalAmt' },
              lastOrderDate: { $max: '$createdAt' }
            }
          }
        ]);

        // Get favorite products (most ordered)
        const favoriteProducts = await OrderModel.aggregate([
          { $match: { userId: user._id } },
          { $unwind: '$product_details' },
          {
            $group: {
              _id: '$product_details.productId',
              totalQuantity: { $sum: '$product_details.quantity' }
            }
          },
          { $sort: { totalQuantity: -1 } },
          { $limit: 3 },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: '_id',
              as: 'productDetails'
            }
          },
          { $unwind: '$productDetails' },
          {
            $project: {
              productId: '$_id',
              name: '$productDetails.name',
              image: { $arrayElemAt: ['$productDetails.image', 0] },
              totalQuantity: 1
            }
          }
        ]);

        return {
          ...user,
          addresses,
          orderStats: orders[0] || {
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: null
          },
          favoriteProducts
        };
      })
    );

    // Get total count for pagination
    const totalUsers = await UserModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        users: enhancedUsers,
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalUsers / limit),
          hasNextPage: (page * limit) < totalUsers,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Admin user data fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user data for admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserDetailedData = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Get basic user info
    const user = await UserModel.findById(userId)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all addresses
    const addresses = await AddressModel.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    // Get complete order history
    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'product_details.productId',
        select: 'name price images'
      })
      .populate({
        path: 'delivery_address',
        select: 'name address_line city state pincode mobile'
      })
      .lean();

    // Calculate statistics
    const stats = await OrderModel.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmt' },
          avgOrderValue: { $avg: '$totalAmt' },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' }
        }
      }
    ]);

    // Get favorite categories
    const favoriteCategories = await OrderModel.aggregate([
      { $match: { userId: user._id } },
      { $unwind: '$product_details' },
      {
        $lookup: {
          from: 'products',
          localField: 'product_details.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        user,
        addresses,
        orders,
        statistics: stats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          avgOrderValue: 0,
          lastOrderDate: null,
          firstOrderDate: null
        },
        favoriteCategories
      }
    });

  } catch (error) {
    console.error('Admin user detail fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateUserStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const userId = req.params.userId;
    const { status, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const validStatuses = ['Active', 'suspended', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { 
        status,
        statusReason: reason || '',
        ...(status === 'banned' && { isBanned: true }),
        ...(status === 'Active' && { isBanned: false })
      },
      { new: true, session }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If banning a user, you might want to cancel their pending orders
    if (status === 'banned') {
      await OrderModel.updateMany(
        { 
          userId,
          orderStatus: { $in: ['PENDING', 'PROCESSING', 'SHIPPED'] }
        },
        { 
          orderStatus: 'CANCELLED',
          cancellationReason: 'User account banned'
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Admin user status update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};