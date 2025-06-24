import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";

export const addToCartItemController = async (request, response) => {
    try {
        // 1. Validate authenticated user
        const userId = request.userId;
        if (!userId) {
            return response.status(401).json({
                message: "Authentication required - Please login to add items to cart",
                error: true,
                success: false
            });
        }

        // 2. Validate request body
        const { productId, quantity } = request.body;
        
        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        if (quantity <= 0) {
            return response.status(400).json({
                message: "Quantity must be at least 1",
                error: true,
                success: false
            });
        }

        // 3. Check if user exists
        const userExists = await UserModel.exists({ _id: userId });
        if (!userExists) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // 4. Check if product already exists in cart to prevent duplicates
        const existingCartItem = await CartProductModel.findOne({ 
            userId, 
            productId 
        });

        if (existingCartItem) {
            return response.status(400).json({
                message: "Product already exists in cart ",
                error: true,
                success: false
            });
        }

        // 5. Create new cart item
        const cartItem = new CartProductModel({
            quantity: quantity,
            userId: userId,
            productId: productId
        });

        const savedItem = await cartItem.save();

        // 6. Update user's shopping cart
        await UserModel.updateOne(
            { _id: userId },
            { $addToSet: { shopping_cart: productId } } // Using $addToSet to prevent duplicates
        );

        return response.status(201).json({
            data: savedItem,
            message: "Item added to cart successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        return response.status(500).json({
            message: error.message || "Internal server error while adding to cart",
            error: true,
            success: false
        });
    }
}

export const getCartItemController=async(request,response)=>{
    try {
        const userId=request.userId

        const cartItem=await CartProductModel.find({
            userId:userId
        }).populate('productId')

        return response.json({
            data:cartItem,
            error:false,
            success:true
        }

        )
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
}

export const updateCartItemController=async(request,response)=>{
    try {
        const userId=request.userId
        const {_id,qty}=request.body

        if(!_id||!qty){
            return response.status(400).json(
                {
                    message:"provide _id, qty",
                    error:true,
                    success:false
                }
            )
        }
        const updateCartitem=await CartProductModel.updateOne({
            _id:_id
        },{
            quantity:qty
        })
        return response.json({
            message:"Item added",
            success:true,
            error:false,
            data:updateCartitem
        })

        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}

export const deleteCartItemController=async(request,response)=>{
    try {
        const userId=request.userId
        const {_id}=request.body
        if(!_id){
            return response.status(400).json({
                message:"Provide _id",
                error:true,
                success:false
            })
        }
        const deleteCartItem=await CartProductModel.findOneAndDelete({
            _id:_id,
            userId:userId
        })

        return response.status(200).json({
            message:"Cart item Deleted successfully",
            error:false,
            success:true,
            data:deleteCartItem
        })

    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}