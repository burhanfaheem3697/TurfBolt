import {Router} from 'express'
import { upload } from '../middlewares/multer.middlewares.js'
import { userLoginValidator, userRegistrationValidator } from '../validators/index.js'
import { validate } from '../middlewares/validate.middlewares.js'
import { forgotPassword, getUser, getUserBookings, loginUser, logoutUser, refreshAccessToken, registerUser, resendEmail, resetPassword, verifyEmail } from '../controllers/auth.controllers.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js'
const router = Router()

router.post('/register',upload.single('avatar'),userRegistrationValidator(),validate,registerUser)
router.post('/login',userLoginValidator(),validate,loginUser)
router.get('/logout',verifyJWT,logoutUser)
router.get('/profile',verifyJWT,getUser)
router.get('/verify/:unhashedToken',verifyEmail)
router.get('/resendEmail',verifyJWT,resendEmail)
router.get('/refresh',refreshAccessToken)
router.post('/forgotPassword',forgotPassword)
router.post('/resetPassword/:unhashedToken',resetPassword)
router.get('/bookings',verifyJWT,getUserBookings)

export default router