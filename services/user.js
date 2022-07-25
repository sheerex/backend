import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Balance, Currency, User } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"
import { sendEmail } from "../helpers/sendEmail.js"
import { checkNotDuplicate, checkNotEmpty } from "../helpers/validations.js"

export async function getUsers(queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const users = await User.findAll({
      where: filterObject, 
      order: sortingArray
    })
    return users
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function getUser(id, includeBalance, queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const include = includeBalance ? {include: [{model: Balance, include: [Currency]}]} : {}
    const user = await User.findOne({
      ...include, 
      where: {id: id, ...filterObject}, 
      order: sortingArray
    })
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

    // sendEmail(
    //   user.email, 
    //   "Sheerex: Verify your Email", 
    //   `In order to operate as a registered user in our platform, 
    //   please verify your email by clicking in the following link: 
    //   ${process.env.BASE_API}users/verified/${verificationCode}`)

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

    checkNotEmpty(loginUser, ["email", "password"], true)

    const user = await User.findOne({where: {email: loginUser.email}})
    if (!user || !(await bcrypt.compare(loginUser.password, user.password)))
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

    const user = await User.findByPk(userPassword. id)
    if (!user)
      throw {status: 404, message:  "User Does Not Exist."} 

    if (!await bcrypt.compare(userPassword.oldPassword, user.password)) 
      throw {status: 401, message: "Invalid Credentials."}

    const encryptedPassword = await bcrypt.hash(userPassword.newPassword, 10)
    user.password = encryptedPassword
    user.save()

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
    user.save()

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