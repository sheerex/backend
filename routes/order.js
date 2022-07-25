import { Router } from "express"
import * as orderController from "../controllers/order.js"
import { checkAdmin, checkUser } from "../middleware/auth.js"

const router = Router()

router.get("/orders", checkUser, checkAdmin, orderController.getOrders)
router.get("/orders/:id", checkUser, orderController.getOrder)

router.post("/orders", orderController.createOrder)
router.patch("/orders/:id", checkUser, orderController.updateOrder)


export default router