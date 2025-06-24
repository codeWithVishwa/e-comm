import UserModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateRefreshToken = async (userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: '7d' }
    );

    try {
        await UserModel.updateOne(
            { _id: userId },
            { refresh_token: token } // Corrected field name
        );
    } catch (error) {
        console.error("Error updating refresh token:", error);
        throw error; // Optional: rethrow if you want calling function to handle it
    }

    return token;
};

export default generateRefreshToken;
