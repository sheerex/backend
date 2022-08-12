import express from "express"
import cors from "cors"
import currencyRouter from "./routes/currency.js"
import networkRouter from "./routes/network.js"
import priceRouter from "./routes/price.js"
import orderRouter from "./routes/order.js"
import userRouter from "./routes/user.js"

const app = express()

app.use(cors({origin: "*"}))
app.use(express.json())
app.use("/", currencyRouter)
app.use("/", networkRouter)
app.use("/", priceRouter)
app.use("/", orderRouter)
app.use("/", userRouter)

app.get("/", async (req, res) => {
  res.sendFile('D:/GoogleSignIn.html')
})

export default app 