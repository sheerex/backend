import { Router } from "express"
import * as networkController from "../controllers/network.js"
import { checkAdmin, checkUser } from "../middleware/auth.js"

const router = Router()

router.get("/networks", networkController.getNetworks)
router.get("/networks/:id", networkController.getNetwork)
router.post("/networks", checkUser, checkAdmin, networkController.createNetwork)
router.patch("/networks/:id", checkUser, checkAdmin, networkController.updateNetwork)
//router.delete("/networks/:id", checkUser, checkAdmin, networkController.deleteNetwork)
    
export default router