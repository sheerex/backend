import * as userService from "../services/user.js"
import jwt from "jsonwebtoken";

export async function checkAdmin (req, res, next) {
  try {
    const isAdmin = await userService.isAdmin(req.user.id)
    if (!isAdmin)
      return res.status(403).json({message: "User Is Not Admin"})    

    return next()
  
  } catch (err) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export function checkUser (req, res, next) {
  try {
    getToken(req)
    return next()

  } catch (err) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }    
}

export function getToken (req) {
  try {
    const token = req.body.token || req.query.token || req.headers["x-access-token"]
    if (!token)
      throw {status: 403, message: "A token is required for authentication"} 

      try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY)
        req.user = decoded;
      } catch (err) {
        throw {status:401, message: "Invalid Token"}
      }     

  } catch (err) {
    throw {status: error?.status || 500, message: error?.message || error}
  }
}