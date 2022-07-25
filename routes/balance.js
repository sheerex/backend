import { Router } from "express"
import * as balanceController from "../controllers/balance.js"
import { checkAdmin, checkUser } from "../middleware/auth.js"

const router = Router()

router.get("/balances", checkUser, checkAdmin, balanceController.getBalances)
router.get("/balances/:id", checkUser, balanceController.getBalances)
    
export default router