import UserModel from "../models/user.model.js";

export const adminCheck = async (req, res, next) => {
    try {
        // 1. Verify userId exists in request
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // 2. Check user exists and is admin
        const user = await UserModel.findById(userId).select('role');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 3. Case-insensitive role check
        if (user.role.toUpperCase() !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Admin privileges required',
                errorCode: 'ADMIN_ACCESS_DENIED'
            });
        }

        // 4. Attach user to request for later use if needed
        req.adminUser = user;
        
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        
        // Specific error for invalid ID format
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Administrative verification failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};