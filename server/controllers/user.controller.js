import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import generatedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageCloudiary from '../utils/uploadImageCloudiary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordOtpTemplate from '../utils/forgotPasswordMail.js'
dotenv.config()

export async function registerUserController(request,response) {
    try {
        const{name,email,password,number}=request.body
        if(!name||!email||!password||!number){
            return response.status(400).json({
                message:"provide email , name, password",
                error:true,
                success:false
            })
        }

        const user=await UserModel.findOne({email})

        if(user){
            return response.json({
                message:"Already register email",
                error:true,
                success:false
            })
        }

        const salt=await bcryptjs.genSalt(10)
        const hashPassword=await bcryptjs.hash(password,salt)

        const payload={
            name,
            email,
            password:hashPassword,
            number
        }

        const newUser=new UserModel(payload)
        const save=await newUser.save()
        const VerifyEmailUrl=`${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`

        const verifyEmail=await sendEmail({
            sendTo:email,
            subject:"verify email from firework",
            html:verifyEmailTemplate({
                name,
                url:VerifyEmailUrl
            })
        })

        return response.json({
            message:"User register successfully",
            error:false,
            success:true,
            data:save

        })


        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
   }

export async function verifyEmailController(request,response) {
    try {
        const {code}=request.body
        const user=await UserModel.findOne({_id:code})

        if(!user){
            return response.status(400).json({
                message:"Invalid code",
                error:true,
                success:false
            })
        }
        const updateUser=await UserModel.updateOne({_id:code},{
            verify_email:true
        })

        return response.json({
            message:"verify email done",
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

export async function loginController(request,response) {
    try {
        const {email='',password=''}=request.body;
        const user=await UserModel.findOne({email})

        if(!email.trim()||!password.trim()){
            return response.status(200).json({
                message:'provide email and password',
                error:true,
                success:false
            })
        }

        if(!user){
            return response.status(400).json({
                message:"User not Registering",
                error:true,
                success:false
            })
        }
        if(user.status!=="Active"){
            return response.status(400).json({
                message:"Account suspended Contact admin",
                error:true,
                success:false
            })

        }
        const checkPassword=await bcryptjs.compare(password,user.password)

        if(!checkPassword){
            return response.status(200).json({
                message:"Check Password",
                error:true,
                success:false
            })
        }
       
        const accesstoken=await generatedAccessToken(user._id)
        const refreshtoken=await generatedRefreshToken(user._id)
        const updateUser=await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date:new Date()
        })
         const cookiesOption={
            httpOnly:true,
            secure:true,
            sameSite:"none"

        }

        

        response.cookie('accessToken',accesstoken,cookiesOption)
        response.cookie('refreshToken',refreshtoken,cookiesOption)

        return response.json({
            message:"Login Successfully",
            error:false,
            success:true,
            data:{
                accesstoken,refreshtoken

            }
        })


        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false,
            
        
    })
    
}

}

export async function logoutController(request, response) {
    try {
        const userId = request.userId; // Using camelCase for variable names

        // Validate userId exists
        if (!userId) {
            return response.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        // Cookie options - consider making this a config constant if reused
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/" // Explicitly setting path is often a good practice
        };

        // Clear both cookies
        response.clearCookie("accessToken", cookiesOption);
        response.clearCookie("refreshToken", cookiesOption);

        // Remove refresh token from database
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: { refresh_token: "" } }, // Using $set operator is more explicit
            { new: true } // Option to return the updated document if needed
        );

        // Check if user was found and updated
        if (!updatedUser) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Logged out successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Logout error:", error); // Logging the error for debugging
        return response.status(500).json({
            message: error.message || "Internal server error during logout",
            error: true,
            success: false
        });
    }
}

export async function uploadAvatar(request,response){
    try {
        const userId=request.userId
        const image=request.file
        const upload=await uploadImageCloudiary(image)
        const updateUser=await UserModel.findByIdAndUpdate(userId,{
            avatar:upload.url
        })

        return response.json({
            message:"upload avatar",
            data:{
                _id:userId,
                avatar:upload.url
            },
            success:true,
            error:false
            
        })
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}

export async function updateUserDetails(request,response) {
    try {
        const userId=request.userId
        const{name,email,number,password}=request.body
        let hashPassword =""

        if(password){
            const salt=await bcryptjs.genSalt(10)
            hashPassword=await bcryptjs.hash(password,salt)

        }

        const updateUser=await UserModel.updateOne({_id:userId},{
            ...(name&&{name:name}),
            ...(email&&{email:email}),
            ...(password&&{password:hashPassword}),
            ...(number&&{number:number})
        })

        return response.json({
            message:"updated user successfully",
            error:false,
            success:true,
            data:updateUser
        })
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error
        })
        
    }
    
}

export async function forgotPasswordController(request,response) {
    try {
        const {email}=request.body
        const user=await UserModel.findOne({email})

        if(!user){
            return response.status(200).json({
                message:"Email not available",
                error:true,
                success:false
                })
        }
        const otp=generatedOtp()
        const expireTime=new Date()+60*60*1000

        const update=await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp:otp,
            forgot_password_expiry:new Date(expireTime).toISOString()

        })
        await sendEmail({
            sendTo:email,
            subject:"Forgot password from Firework",
            html:forgotPasswordOtpTemplate({
                name:user.name,
                otp:otp
            })
        })
        return response.json({
            message:"check your email",
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

export async function verifyForgotPasswordOtp(request,response) {
    try {
        const {email,otp}=request.body

        if (!email||!otp) {
            return response.status(400).json({
            message:"Provide required field email,otp.",
            error:true,
            success:false

        })
            
        }
        const user=await UserModel.findOne({email})

        if(!user){
            return response.status(400).json({
                message:"Email not available",
                error:true,
                success:false
                })
        }
        const currentTime=new Date()

        if(user.forgot_password_expiry<currentTime){
            return response.status(400).json({
                message:"Otp is expired",
                error:true,
                success:false
            })
        }
        if(otp!==user.forgot_password_otp){
            return response.status(400).json({
                message:"Invalid otp",
                error:true,
                success:false

            })

        }
        const updateUser=await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp:"",
            forgot_password_expiry:""
        })

        return response.json({
            message:"Verify Otp successfully",
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

export async function resetpassword(request,response) {
    try {
        const {email,newPassword,confirmPassword}=request.body
        if(!email||!newPassword||!confirmPassword){
            response.status(200).json({
                message:"Provide required field ",
                error:true,
                success:false
            })
        }
        const user=await UserModel.findOne({email})

        if(!user){
            return response.status(200).json({
                message:"Email is not available",
                error:true,
                success:false
            })
        }
        if(newPassword!==confirmPassword){
            return response.status(200).json({
                  message:"newPassword and confirmPassword are not same",
                  error:true,
                  success:false
            })

        }
        const salt=await bcryptjs.genSalt(10)
        const hashPassword=await bcryptjs.hash(newPassword,salt)

        const update=await UserModel.findOneAndUpdate(user._id,{
            password:hashPassword
        })

        return response.json({
            message:"Password updated successfully",
            error:false,
            success:true
        })


    } catch (error) {
        response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
    
}

export async function refresh_token(request,response) {
    try {
        const refreshToken =
              request.cookies.refreshToken ||
              request.headers.authorization?.split(" ")[1];

        
        if(!refreshToken){
            return response.status(401).json({
                message:"Invalid token",
                error:true,
                success:false
            })
        }
        const verifyToken=await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)
        if(!verifyToken){
            return response.status(401).json({
                message:"Token is expired",
                error:true,
                success:false
            })
        }
        const userId=verifyToken?._id
        const newAccessToken=await generatedAccessToken(userId)

         const cookiesOption={
            httpOnly:true,
            secure:true,
            sameSite:"none"

        }

        response.cookie('accessToken',newAccessToken,cookiesOption)

        return response.json({
            message:"New Access token generated",
            error:false,
            success:true,
            data:{
                accessToken:newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message:error.message||error
            
        })
        
    }
    
}

export async function userDetails(request, response) {
  try {
    const userId = request.userId;

    // Ensure userId exists (optional but helpful in debugging)
    if (!userId) {
      return response.status(400).json({
        message: "User ID not found in request.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId).select("-password -refresh_token"); // exclude password if you store it

    // Check if user was found
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "User detail fetched successfully",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("userDetails error:", error);
    return response.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
}

export async function updateLastActive(request,response){
    try {
        const userId=request.userId
        await UserModel.findByIdAndUpdate(
            userId,
            {lastActive:new Date()},
            {new:true}
        )
        return response.status(200).json({success:true})

    } catch (error) {
         return response.status(500).json({
            success:false,
            error:error.message||error})
        
        
    }

}


