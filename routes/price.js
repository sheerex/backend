import { Router } from "express"
import * as priceController from "../controllers/price.js"
import { checkAdmin, checkUser } from "../middleware/auth.js"

const router = Router()

router.get("/prices", priceController.getPrices)
router.get("/prices/:id", priceController.getPrice)
router.get("/prices/:id/:id2", priceController.getPriceByCurrencies)
router.post("/prices", checkUser, checkAdmin, priceController.createPrice)
router.patch("/prices/:id", checkUser, checkAdmin, priceController.updatePrice)
//router.delete("/prices/:id", checkUser, checkAdmin, priceController.deletePrice)
    
export default router