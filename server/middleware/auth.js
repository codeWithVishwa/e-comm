import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const auth = async (request, response, next) => {
    try {
        // 1. Token Extraction
        const token = request.cookies?.accessToken || 
                     request.headers?.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return response.status(401).json({
                message:"please login to continue",
                error: true,
                success: false,
                action: "redirect",
                redirectTo: "/login"
            });
        }

        // 2. Token Verification
        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        
        if (!decoded?.id) {
            return response.status(401).json({
                message: "Session invalid - Please login again",
                error: true,
                success: false,
                action: "clear_tokens",
                redirectTo: "/login"
            });
        }

        // 3. Attach user to request
        request.userId = decoded.id;
        next();

    } catch (error) {
        // 4. Enhanced Error Handling
        const errorResponse = {
            message: "Authentication failed - Please login to continue",
            error: true,
            success: false,
            action: "clear_tokens",
            redirectTo: "/login"
        };

        if (error instanceof jwt.JsonWebTokenError) {
            errorResponse.message = "Invalid session - Please login again";
            return response.status(401).json(errorResponse);
        }

        if (error instanceof jwt.TokenExpiredError) {
            errorResponse.message = "Session expired - Please login again";
            return response.status(401).json(errorResponse);
        }

        console.error('Auth Middleware Error:', error);
        return response.status(500).json({
            ...errorResponse,
            message: "Authentication service unavailable"
        });
    }
};

export default auth;