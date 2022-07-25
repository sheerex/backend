import { Op } from "sequelize"
import * as userService from "../services/user.js"


export async function checkNotDuplicate(model, field, value, id) {
  try {
    if (!value)
      return
    let whereObject = {}
    whereObject[field] = value
    if (id)
      whereObject = {...whereObject, [Op.not]: {id: id}}
    const instance = await model.findOne({attributes: [field], where: whereObject})
    if (instance)
      throw {status: 409, message: `${field} Already Exist.`}
  } catch (error) {
      throw {status: error?.status || 500, message: error.message}
  }
}

export function checkNotEmpty(object, arrFields, required) {
  try {
    for (const field of arrFields) {
      if (required && !object.hasOwnProperty(field))
        throw {status: 422, message: `${field} is required.`}
      if (!required && object.hasOwnProperty(field) && !object[field])
        throw {status: 422, message: `${field} is required.`}
    }

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function checkUserAccess(userReqId, userLoggedId, message) {
  try {
    const isAdmin = await userService.isAdmin(userLoggedId)
    if (!isAdmin && userLoggedId != userReqId) 
      throw {status: 403, message: message}
    return isAdmin
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}
