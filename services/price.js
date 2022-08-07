import { Op } from "sequelize"
import { Price } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"
import { checkNotDuplicate, checkNotEmpty } from "../helpers/validations.js"

export async function getPrices(queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const prices = await Price.findAll({
      include: ["currency", "currency2"], 
      where: filterObject, 
      order: sortingArray
    })
    return prices
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function getPrice(id, queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const price = await Price.findOne({
      include: ["currency", "currency2"], 
      where: {id, ...filterObject}, 
      order: sortingArray
    })
    if (!price)
      throw {status: 404, message:  "Price Does Not Exist."}    
    return price
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function getPriceByCurrencies(currencyId, currency2Id) {
  try {
    const price = await Price.findOne({
      include: ["currency", "currency2"], 
      where: {currencyId, currency2Id}
    })
    if (!price)
      throw {status: 404, message:  "Price Does Not Exist."}    
    return price
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function createPrice(newPrice) {
  try {
    checkNotEmpty(newPrice, ["price", "currencyId", "currency2Id", "active"], true)      
    
    const priceDuplicate = await Price.findOne({
      attributes: ['price'], 
      where: {currencyId: newPrice.currencyId, currency2Id: newPrice.currency2Id}
    })
    if (priceDuplicate) {
      throw {status: 409, message: "Price Already Exist."}
    }
      
    const price = await Price.create(newPrice, {include: ["currency", "currency2"]})

    delete price.dataValues.createdAt
    delete price.dataValues.updatedAt

    return price

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function updatePrice(updatedPrice) {
  try {
    checkNotEmpty(updatedPrice, ["id"], true)
    checkNotEmpty(updatedPrice, ["price"], false)

    const price = await Price.findByPk(updatedPrice.id)
    if (!price)
      throw {status: 404, message:  "Price Does Not Exist."}

    delete updatedPrice.currencyId
    delete updatedPrice.currency2Id

    Object.assign(price, updatedPrice)  
    await price.save()

    return price
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function deletePrice(id) {
  try {
    if(!id)
      throw {status: 422, message:  "Id is Required."}

    const row = await Price.destroy({
       where: {
        id: id,
      },
    })

    if (!row)
      throw {status: 404, message:  "Price Does Not Exist."}
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

