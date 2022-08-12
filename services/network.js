import { Op } from "sequelize"
import { Network } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"
import { checkNotDuplicate, checkNotEmpty } from "../helpers/validations.js"

export async function getNetworks(queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const networks = await Network.findAll({where: filterObject, order: sortingArray})
    return networks
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function getNetwork(id, queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const network = await Network.findOne({where: {id: id, ...filterObject}, order: sortingArray})
    if (!network)
      throw {status: 404, message:  "Network Does Not Exist."}
    return network
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function createNetwork(newNetwork) {
  try {
      
    checkNotEmpty(newNetwork, ["name", "active"], true)
    await checkNotDuplicate(Network, "name", newNetwork.name)

    const network = await Network.create(newNetwork)

    delete network.dataValues.createdAt
    delete network.dataValues.updatedAt
    
    return network

  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function updateNetwork(updatedNetwork) {
  try {
    checkNotEmpty(updatedNetwork, ["id"], true)
    checkNotEmpty(updatedNetwork, ["name"], false)

    const network = await Network.findByPk(updatedNetwork.id)
    if (!network)
      throw {status: 404, message:  "Network Does Not Exist."}

    await checkNotDuplicate(Network, "name", updatedNetwork.name, updatedNetwork.id)
      
    Object.assign(network, updatedNetwork)  
    await network.save()

    return network
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function deleteNetwork(id) {
  try {
    if(!id)
      throw {status: 422, message:  "Id is Required."}

    const row = await Network.destroy({
       where: {
        id: id,
      },
    })

    if (!row)
      throw {status: 404, message:  "Network Does Not Exist."}
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

