import MessageModel from "../models/message.model.js";
import rateLimit from 'express-rate-limit';

// Rate limiting configuration for sending messages
export const messageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 messages per windowMs
  handler: (req, res) => {
    return res.status(429).json({
      message: "Too many messages sent. Please try again later.",
      error: true,
      success: false
    });
  }
});

export const SendMessageToAdmin = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, subject, message } = req.body;

    // 1. Authentication check
    if (!userId) {
      return res.status(401).json({
        message: "Please login to send messages",
        error: true,
        success: false
      });
    }

    // 2. Required fields check
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false
      });
    }

    // 3. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        error: true,
        success: false
      });
    }

    // 4. Message length validation
    if (message.length > 1000) {
      return res.status(400).json({
        message: "Message too long (max 1000 characters)",
        error: true,
        success: false
      });
    }

    // 5. Check for duplicate messages (same content from same user)
    const recentDuplicate = await MessageModel.findOne({
      userId,
      message,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (recentDuplicate) {
      return res.status(429).json({
        message: "Duplicate message detected",
        error: true,
        success: false
      });
    }

    // 6. Enhanced spam detection
    const spamKeywords = [
      'http://', 'https://', 'www.', 
      'buy now', 'click here', 'free',
      'discount', 'offer', 'limited time',
      'make money', 'earn cash', 'work from home',
      'viagra', 'casino', 'loan', 'credit score'
    ];
    
    const containsSpam = spamKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase()) || 
      subject.toLowerCase().includes(keyword.toLowerCase())
    );

    if (containsSpam) {
      // Log potential spam attempts
      console.warn(`Potential spam message from user ${userId}: ${subject}`);
      return res.status(400).json({
        message: "Message contains suspicious content",
        error: true,
        success: false
      });
    }

    // 7. Save the message
    const newMessage = new MessageModel({
      userId,
      name,
      email,
      subject,
      message,
      status: 'unread' // Initial status
    });

    const savedMessage = await newMessage.save();

    return res.status(200).json({
      data: savedMessage,
      message: "Message sent successfully",
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Message sending error:', error);
    return res.status(500).json({
      message: "An error occurred while sending your message",
      error: true,
      success: false
    });
  }
};

export const GetMessagesForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build the query
    const query = {};
    
    if (status) {
      query.status = status; // 'unread', 'read', 'archived'
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Get messages with pagination
    const messages = await MessageModel.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Count total messages for pagination info
    const totalMessages = await MessageModel.countDocuments(query);

    return res.status(200).json({
      data: messages,
      pagination: {
        total: totalMessages,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalMessages / limit)
      },
      message: "Messages retrieved successfully",
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      message: "An error occurred while fetching messages",
      error: true,
      success: false
    });
  }
};

export const UpdateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!['read', 'unread', 'archived'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        error: true,
        success: false
      });
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        message: "Message not found",
        error: true,
        success: false
      });
    }

    return res.status(200).json({
      data: updatedMessage,
      message: "Message status updated successfully",
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    return res.status(500).json({
      message: "An error occurred while updating message status",
      error: true,
      success: false
    });
  }
};

export const DeleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Validate messageId exists
    if (!messageId) {
      return res.status(400).json({
        message: "Message ID is required",
        error: true,
        success: false
      });
    }

    const deletedMsg = await MessageModel.findByIdAndDelete(messageId);

    // Check if message was found and deleted
    if (!deletedMsg) {
      return res.status(404).json({
        message: "Message not found",
        error: true,
        success: false
      });
    }

    return res.status(200).json({
      data: deletedMsg,
      message: "Message deleted successfully",
      success: true,
      error: false
    });

  } catch (error) {
    console.error("Error deleting message:", error); // Log the error for debugging
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
};