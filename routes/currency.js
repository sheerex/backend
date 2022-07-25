import { Router } from "express"
import * as currencyController from "../controllers/currency.js"
import { checkAdmin, checkUser } from "../middleware/auth.js"

const router = Router()

router.get("/currencies", checkUser, checkAdmin, currencyController.getCurrencies)
router.get("/currencies/:id", checkUser, checkAdmin, currencyController.getCurrency)
router.post("/currencies", checkUser, checkAdmin, currencyController.createCurrency)
router.patch("/currencies/:id", checkUser, checkAdmin, currencyController.updateCurrency)
//router.delete("/currencies/:id", checkUser, checkAdmin, currencyController.deleteCurrency)
    
export default router