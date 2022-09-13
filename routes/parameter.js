import { Router } from "express"
import * as parameterController from "../controllers/parameter.js"
import { checkAdmin, checkUser } from "../middleware/auth.js"

const router = Router()

router.get("/parameters", parameterController.getParameters)
router.patch("/parameters/:id", checkUser, checkAdmin, parameterController.updateParameter)
    
export default router