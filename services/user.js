import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Balance, Currency, Order, User } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"
import { sendEmail } from "../helpers/sendEmail.js"
import { checkNotDuplicate, checkNotEmpty } from "../helpers/validations.js"
import { googleVerification } from "../helpers/googleVerification.js"

export async function getUsers(queryObject) {
  try {
    const { filterObject, sortingArray, limit, offset } = parseQueryParams(queryObject)
    const users = await User.findAll({
      where: filterObject, 
      order: sortingArray,
      ...limit,
      ...offset
    })
    return users
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function getUser(id, includeBalance, includeOrders, queryObject) {
  try {
    const { filterObject, sortingArray, limit, offset } = parseQueryParams(queryObject)
    const includeBalanceArray = includeBalance ? [{model: Balance, include: [Currency], ...limit, ...offset}] : []
    const includeOrdersArray = includeOrders ? [{
      model: Order, 
      as: "orders", 
      include: [ "currency", "currency2", "operator"], 
      where: {...filterObject}, 
      required: false,
      ...limit, 
      ...offset
    }] : []
    const include = {include: [...includeBalanceArray, ...includeOrdersArray]}

    const user = await User.findOne({
      ...include, 
      where: {id: id}, 
      order: sortingArray
    })
    if (!user)
      throw {status: 404, message:  "User Does Not Exist."} 
    return user
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function createUser(newUser) {
  try {

    // VALIDATIONS
    checkNotEmpty(newUser, ["username", "email", "password"], true)
    await checkNotDuplicate(User, "username", newUser.username)
    await checkNotDuplicate(User, "email", newUser.email)
    
    // CREATION
    const encryptedPassword = await bcrypt.hash(newUser.password, 10)
    const verificationCode = Math.floor(100000 + Math.random() * 900000)
    const user = await User.create({
      username: newUser.username,
      email: newUser.email.toLowerCase(), 
      password: encryptedPassword,
      isAdmin: false,
      verified: false,  
      active: true,
      verificationCode
    })

    if (process.env?.TEST !== "SI")
      sendEmail(
        user.email, 
        "Sheerex: Verify your Email", 
        `In order to operate as a registered user in our platform, 
please verify your email entering the following verification code: 
${verificationCode}`)

    delete user.dataValues.password
    delete user.dataValues.verificationCode
    delete user.dataValues.createdAt
    delete user.dataValues.updatedAt
    
    return user
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function updateUser(updatedUser) {
  try {
    checkNotEmpty(updatedUser, ["id"], true)
    checkNotEmpty(updatedUser, ["username", "email"], false)
  
    const user = await User.findByPk(updatedUser.id)
    if (!user)
      throw {status: 404, message:  "User Does Not Exist."} 

    await checkNotDuplicate(User, "username", updatedUser.username, updatedUser.id)
    await checkNotDuplicate(User, "email", updatedUser.email, updatedUser.id)
  
    delete updatedUser.password

    if (updatedUser.email)
      updatedUser.email = updatedUser.email.toLowerCase()

    Object.assign(user, updatedUser)  
    await user.save()

    return user
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function deleteUser(id) {
  try {
    if(!id)
      throw {status: 422, message:  "Id is Required."}

    const row = await User.destroy({
      where: {
        Id: id,
      },
    })

    if (!row)
      throw {status: 404, message:  "User Does Not Exist."}
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function login(loginUser) {
  try {
    let email, googleAuthenticated
    if (loginUser.googleToken) {
      checkNotEmpty(loginUser, ["googleToken"], true)
      email = await googleVerification(loginUser.googleToken)
      googleAuthenticated = true
    }
    else {
      checkNotEmpty(loginUser, ["email", "password"], true)
      email = loginUser.email
      googleAuthenticated = false
    }

    const user = await User.findOne({attributes: ["id", "active", "password", "verified"], where: {email: email}})

    if (!user || (!googleAuthenticated && !(await bcrypt.compare(loginUser.password, user.password))))
      throw {status: 401, message: "Invalid Credentials."}
    if (!user.verified)
      throw {status: 401, message: "User Not Verified."}
    if (!user.active)
      throw {status: 401, message: "User Not Active."}
    const token = jwt.sign(
      { id: user.id },
      process.env.TOKEN_KEY,
      {
        expiresIn: process.env.TOKEN_EXPIRATION,
      }
    )
    return { token }

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function changePassword(userPassword) {
  try {
    checkNotEmpty(userPassword, ["id", "newPassword", "oldPassword"], true)

    const user = await User.findByPk(userPassword.id)
    if (!user)
      throw {status: 404, message:  "User Does Not Exist."} 

    if (!await bcrypt.compare(userPassword.oldPassword, user.password)) 
      throw {status: 401, message: "Invalid Credentials."}

    const encryptedPassword = await bcrypt.hash(userPassword.newPassword, 10)
    user.password = encryptedPassword
    await user.save()

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function verifyEmail(verificationCode) {
  try {
    if (!verificationCode)
      throw {status:400, message: "Verification Code is Required."}

    const user = await User.findOne({where: {verificationCode: verificationCode}})
    if (!user)
      throw {status: 404, message:  "Verification Code Invalid."}     

    user.verificationCode = null
    user.verified = true
    await user.save()

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function resendVerificationCode(email) {
  try {
    const user = await User.findOne({where: {email: email}})
    if (!user)
      throw {status: 404, message:  "User Does Not Exist."}
    
    if (user.verified)
      throw {status: 400, message: "User already registered."}

  const verificationCode = Math.floor(100000 + Math.random() * 900000)
  user.verificationCode = verificationCode
  await user.save()

  sendEmail(
    user.email, 
    "Sheerex: Verify your Email", 
    `In order to operate as a registered user in our platform, 
    please verify your email entering the following verification code: 
    ${verificationCode}`)

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function sendResetPassword(email) {
  try {
    if (!email)
      throw {status: 422, message: "Email is required"}     
    const user = await User.findOne({where: {email: email}})
    if (!user)
      throw {status: 404, message:  "User Does Not Exist."}
    const token = jwt.sign(
      { id: user.id, command: "ResetPassword" },
      process.env.TOKEN_KEY,
      {
        expiresIn: "10m",
      }
    )
    return { token }      
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function resetPassword(token) {
  if (!token)
    throw {status: 422, message: "A token is required"}
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY)
    if (decoded.command !== "ResetPassword")
      throw {status: 400, message: "Invalid Token"}
    const user = await User.findByPk(decoded.id)
    if (!user)
      throw {status: 404, message:  "User Does Not Exist."}
    const password = Math.floor(100000 + Math.random() * 900000)
    const encryptedPassword = await bcrypt.hash(password.toString(), 10)
    user.password = encryptedPassword
    await user.save()

    sendEmail(
      user.email, 
      "Sheerex: Reset Password", 
      `Your new password is: ${password}`)

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function isAdmin(id) {
  try {
    const user = await User.findByPk(id)
    return user?.isAdmin
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}