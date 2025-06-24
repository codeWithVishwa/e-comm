import ProductModel from "../models/product.model.js";

// Create Product
export const createProductController = async (request, response) => {
    try {
        const { name, image, unit, stock, price, discount, description, rating } = request.body;

        if (!name||!image||!unit||!stock||!price||!description||!rating) {
            return response.status(400).json({
                message: "All required fields must be provided",
                error: true,
                success: false
            });
        }

        const product = new ProductModel({
            name,
            image,
            unit,
            stock,
            price,
            discount: discount || 0,
            description,
            rating: rating || 0
        });

        const savedProduct = await product.save();

        return response.status(201).json({
            message: "Product created successfully",
            data: savedProduct,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Failed to create product",
            error: true,
            success: false
        });
    }
};

// Get Products
export const getProductController = async (request, response) => {
    try {
        let { page = 1, limit = 10, search } = request.body;

        page = Number(page);
        limit = Number(limit);

        const query = search ? {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        } : {};

        const skip = (page - 1) * limit;

        const [products, totalCount] = await Promise.all([
            ProductModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ProductModel.countDocuments(query)
        ]);

        return response.status(200).json({
            data: products,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Failed to fetch products",
            error: true,
            success: false
        });
    }
};

//get Single Product
export const getSingleProduct=async(request,response)=>{
    try {
        const {productId}=request.params;
        if(!productId){
            return response.status(400).json({
                message:"Can't get a single product",
                error:true,
                success:false
            })
        }

        const SingleProduct=await ProductModel.findById(productId)
        return response.status(200).json({
            data:SingleProduct,
            message:"get Single Product successfully",
            error:false,
            success:true
        })
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }


}

// Update Product (without image editing)
export const updateProductController = async (request, response) => {
    try {
        const { productId } = request.params;
        const { name, unit, stock, price, discount, description, rating } = request.body;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        const updates = {
            name,
            unit,
            stock,
            price,
            discount,
            description,
            rating
        };

        // Remove undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Product updated successfully",
            data: updatedProduct,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Failed to update product",
            error: true,
            success: false
        });
    }
};

// Delete Product
export const deleteProductController = async (request, response) => {
    try {
        const { productId } = request.params;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        const deletedProduct = await ProductModel.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Product deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Failed to delete product",
            error: true,
            success: false
        });
    }
};

