import { Parameter } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"

export async function getParameters(queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const parameters = await Parameter.findAll({where: filterObject, order: sortingArray})
    return parameters
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function updateParameter(updatedParameter) {
  try {
    const {id, value} = updatedParameter
    if(!id)
      throw {status: 422, message:  "Id is Required."}

    const parameter = await Parameter.findByPk(id)
    if (!parameter)
      throw {status: 404, message:  "Parameter Does Not Exist."}

    if (!value)
      throw {status: 422, message: "Value is required."}
    console.log(value) 
    parameter.value = value
//    parameter.value = "a\nb"
    await parameter.save()

    return parameter
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}


