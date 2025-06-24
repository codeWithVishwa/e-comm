import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";


export const addAddressController=async(request,response)=>{
    try {
       const userId=request.userId
       const {name,address_line,city,state,pincode,country,mobile,isDefault}=request.body

       const createAddress=new AddressModel({
        name,
        address_line,
        city,
        state,
        pincode,
        country,
        mobile,
        isDefault,
        userId:userId

       })
       const saveAddress=await createAddress.save()
       const addUserAddressId=await UserModel.findByIdAndUpdate(userId,{
        $push:{
            address_details:saveAddress._id
        }
       })
       return response.json({
        message:"Address Created Successfully",
        error:false,
        success:true,
        data:saveAddress
       })


 
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
         })
        
    }
}

export const getAddressController=async(request,response)=>{
    try {
        const userId=request.userId
        const data=await AddressModel.find({userId:userId})

        return response.json({
            data:data,
            message:"List of Address",
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

export const deleteAddressController = async (request, response) => {
    try {
        const userId = request.userId;
        const { addressId } = request.params;

        // Check if the address belongs to the user
        const address = await AddressModel.findOne({ _id: addressId, userId: userId });
        
        if (!address) {
            return response.status(404).json({
                message: "Address not found or you don't have permission to delete it",
                error: true,
                success: false
            });
        }

        // Delete the address
        await AddressModel.findByIdAndDelete(addressId);

        // Remove the address reference from user's address_details array
        await UserModel.findByIdAndUpdate(userId, {
            $pull: {
                address_details: addressId
            }
        });

        return response.json({
            message: "Address deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
