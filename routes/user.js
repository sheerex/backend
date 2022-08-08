import { Router } from "express"
import * as userController from "../controllers/user.js"
import { checkAdmin, checkUser } from "../middleware/auth.js"

const router = Router()

router.get("/users", checkUser, checkAdmin, userController.getUsers)
router.get("/users/:id", checkUser, userController.getUser)
router.get("/users/:id/balances", checkUser, userController.getUser)
router.get("/users/:id/orders", checkUser, userController.getUser)


router.post("/users", userController.createUser)
router.patch("/users/:id", checkUser, userController.updateUser)

//router.delete("/users/:id", userController.deleteUser)

router.post("/users/login", userController.login)
router.patch("/users/password/:id", checkUser, userController.changePassword)
router.patch("/users/verified/:verificationCode", userController.verifyEmail)
router.patch("/users/reverified/:email", userController.resendVerificationCode)
router.patch("/users/generateresetpassword/:email", userController.sendResetPassword)
router.patch("/users/resetpassword/:token", userController.resetPassword)

export default router