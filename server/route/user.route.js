import {Router} from 'express'
import { forgotPasswordController, loginController, logoutController, refresh_token, registerUserController,resetpassword,updateLastActive,updateUserDetails,uploadAvatar,userDetails,verifyEmailController, verifyForgotPasswordOtp } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter=Router()
userRouter.post('/register',registerUserController)
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginController)
userRouter.get('/logout',auth,logoutController)
userRouter.post('/upload-avatar',auth,upload.single('avatar'),uploadAvatar)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/reset-password',resetpassword)
userRouter.post('/refresh-token',refresh_token)
userRouter.get('/userdetails',auth,userDetails)
userRouter.patch('/update-last-active',auth,updateLastActive)

export default userRouter