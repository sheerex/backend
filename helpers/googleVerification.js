import {OAuth2Client} from "google-auth-library"
import * as dotenv from 'dotenv'
dotenv.config()

export async function googleVerification(token) {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, 
    })
    const payload = ticket.getPayload()
    return payload.email
  } catch (error) {
    throw {status: 401, message: "Invalid Google Credentials."}
  }
}