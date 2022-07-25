import { Op } from "sequelize"
import { Currency } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"
import { checkNotDuplicate, checkNotEmpty } from "../helpers/validations.js"

export async function getCurrencies(queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const currencies = await Currency.findAll({where: filterObject, order: sortingArray})
    return currencies
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function getCurrency(id, queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const currency = await Currency.findOne({where: {id: id, ...filterObject}, order: sortingArray})
    return currency
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function createCurrency(newCurrency) {
  try {
      
    checkNotEmpty(newCurrency, ["name", "symbol"], true)
    await checkNotDuplicate(Currency, "name", newCurrency.name)
    await checkNotDuplicate(Currency, "symbol", newCurrency.symbol)

    const currency = await Currency.create(newCurrency)
    return currency

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function updateCurrency(updatedCurrency) {
  try {
    checkNotEmpty(updatedCurrency, ["id"], true)
    checkNotEmpty(updatedCurrency, ["name", "symbol"], false)

    const currency = await Currency.findByPk(id)
    if (!currency)
      throw {status: 404, message:  "Currency Does Not Exist."}

    await checkNotDuplicate(User, "name", updatedCurrency.name, updatedCurrency.id)
    await checkNotDuplicate(User, "symbol", updatedCurrency.symbol, updatedCurrency.id)
      
    Object.assign(currency, updatedCurrency)  
    await currency.save()

    return currency
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function deleteCurrency(id) {
  try {
    if(!id)
      throw {status: 422, message:  "Id is Required."}

    const row = await Currency.destroy({
       where: {
        id: id,
      },
    })

    if (!row)
      throw {status: 404, message:  "Currency Does Not Exist."}
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

