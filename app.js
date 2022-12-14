import express from "express"
import cors from "cors"
import currencyRouter from "./routes/currency.js"
import networkRouter from "./routes/network.js"
import parameterRouter from "./routes/parameter.js"
import priceRouter from "./routes/price.js"
import orderRouter from "./routes/order.js"
import userRouter from "./routes/user.js"
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()

const CORSSettings =  process.env?.CORS ? process.env?.CORS : '*'
app.use(cors({origin: CORSSettings}))
app.use(express.json())
app.use("/", currencyRouter)
app.use("/", networkRouter)
app.use("/", parameterRouter)
app.use("/", priceRouter)
app.use("/", orderRouter)
app.use("/", userRouter)

export default app 