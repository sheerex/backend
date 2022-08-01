import * as orderService from "../services/order.js"
import * as userService from "../services/user.js"
import { checkUserAccess } from "../helpers/validations.js"
import { getToken } from "../middleware/auth.js"
import { fieldsDefined } from "../helpers/objects.js"
import { Operations, States, Types } from "../models/enum.js";


export async function getOrders(req, res) {
  try {
    const orders = await orderService.getOrders(req.query)
    return res.json(orders)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function getOrder(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    
    const order = await orderService.getOrder(req.params.id, req.query)

    await checkUserAccess(order.userId, req.user.id, "User is not Admin and can only Get his own orders.")

    return res.json(order)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function createOrder(req, res) {
  try {
    try {
      getToken(req)
    } catch (error) {
      if (error.status === 500)
        throw {status: error?.status || 500, message: error?.message || error}
    }

    if (!req.user)
      delete req.body.userId

    if (req.user) {
      const isAdmin = await userService.isAdmin(req.user.id)
      if (!isAdmin || (isAdmin && !req.body.userId))
        req.body.userId = req.user.id
    }

    const order = await orderService.createOrder(req.body)
    return res.status(201).json(order)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function updateOrder(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    const isAdmin = await userService.isAdmin(req.user.id)
    if (!isAdmin) {
      const order = await orderService.getOrder(req.params.id)
      await checkUserAccess(order.userId, req.user.id, "User is not Admin and can only Update his own orders.")

      const listFieldsDefine = fieldsDefined(req, ["comments", "contact", "operatorId"])
      if (listFieldsDefine)
        return res.status(403).send({message: `User is not Admin and can not update ${listFieldsDefine}.`})

      if (req.body.state) {
        if (req.body.state !== States.Canceled)
          return res.status(403).send({message: `User is not Admin and only can Cancel an Order.`})
        if (order.state !== States.Pending) 
          return res.status(403).send({message: `User is not Admin and only can Cancel a Pending Order.`})
      }
    }

    let updatedOrder = {id: req.params.id}
    if (req.body.state)
      updatedOrder = {...updatedOrder, state: req.body.state}
    if (req.body.hasOwnProperty("comments"))
      updatedOrder = {...updatedOrder, comments: req.body.comments}
    if (req.body.contact)
      updatedOrder = {...updatedOrder, contact: req.body.contact}
    if (req.body.hasOwnProperty("operatorId")) {
      if (req.body.operatorId) {
        const isAdmin = await userService.isAdmin(req.body.operatorId)
        if (!isAdmin)
          return res.status(403).send({message: `Operator is Not Admin`})
      }
      updatedOrder = {...updatedOrder, operatorId: req.body.operatorId}
    }

    const order = await orderService.updateOrder(updatedOrder)
    return res.json(order);
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}