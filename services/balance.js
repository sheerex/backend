import { Op } from "sequelize"
import { Balance, Currency, User } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"

export async function getBalances(queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const balances = await Balance.findAll({
      include: [User, Currency], 
      where: filterObject, 
      order: sortingArray})
    return balances
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function getUserBalances(userId, queryObject) {
  try {
    console.log("user");
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const balances = await Balance.findAll({
      include: [User, Currency], 
      where: {userId, ...filterObject}, 
      order: sortingArray})
    return balances
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function updateBalance(updatedBalance) {
  try {
    checkNotEmpty(updatedBalance, ["id", "value"], true)    

    const balance = await Balance.findByPk(updatedBalance.id)
    if (!balance)
      throw {status: 404, message:  "Balance Does Not Exist."}
    
    balance.value = updatedBalance.value
    await balance.save()

    return balance
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}