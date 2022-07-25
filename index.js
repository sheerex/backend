import dotenv from "dotenv"
import { createServer } from "http";
import  app  from "./app.js";

dotenv.config()

const server = createServer(app)

const port = process.env.PORT

// server listening 
server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
