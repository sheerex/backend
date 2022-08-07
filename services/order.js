import { Order, User } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"
import { sendEmail } from "../helpers/sendEmail.js"
import { checkNotDuplicate, checkNotEmpty } from "../helpers/validations.js"
import { Operations, States, Types } from "../models/enum.js";
import * as priceService from "../services/price.js"
import * as userService from "../services/user.js"


export async function getOrders(queryObject) {
    try {
      const { filterObject, sortingArray, limit, offset } = parseQueryParams(queryObject)
      const orders = await Order.findAll({
        include: ["user", "currency", "currency2", "operator"], 
        where: filterObject, 
        order: sortingArray,
        ...limit, 
        ...offset
      })
      return orders
    } catch (error) {
      throw {status: 500, message: error.message}
    }  
  }

export async function getOrder(id, queryObject) {
  try {
    const { filterObject, sortingArray } = parseQueryParams(queryObject)
    const order = await Order.findOne({
      include: [User, "currency", "currency2", "operator"], 
      where: {id: id, ...filterObject}, 
      order: sortingArray
    })
    if (!order)
      throw {status: 404, message:  "Order Does Not Exist."} 
    return order
  } catch (error) {
    throw {status: 500, message: error.message}
  }  
}

export async function createOrder(newOrder) {
  try {

    checkNotEmpty(newOrder, ["operation", "amount", "currencyId"], true)
    checkNotEmpty(newOrder, ["userId"], false)
    if (!newOrder.userId) {
      if (newOrder.operation === Operations.Deposit || newOrder.operation === Operations.Withdraw)
        throw {status: 400, message: "Invalid Operation for unregistered user."}
      if (newOrder.type === Types.Limit)  
        throw {status: 400, message: "Invalid Type for unregistered user."}
      checkNotEmpty(newOrder, ["contact", "email"], true)
    }

    if (newOrder.operation === Operations.Swap) {
      checkNotEmpty(newOrder, ["type", "currency2Id"], true)
      if (newOrder.type === Types.Limit)
        checkNotEmpty(newOrder, ["price"], true)
      if (newOrder.type === Types.Market) {
        const price = await priceService.getPriceByCurrencies(newOrder.currencyId, newOrder.currency2Id)
        newOrder.price = price.price
      }
    }

    if (newOrder.operation === Operations.Deposit || newOrder.operation === Operations.Withdraw) {
      delete newOrder.type
      delete newOrder.price
      delete newOrder.currency2Id
    }
    
    delete newOrder.state
    
    const order = await Order.create(newOrder, {include: [User, "currency", "currency2"]})

    delete order.dataValues.createdAt
    delete order.dataValues.updatedAt

    const orderCreated = await Order.findOne({
      include: [User, "currency", "currency2", "operator"], 
      where: {id: order.dataValues.id}
    })

    const email = orderCreated.dataValues.user?.email ? 
                    orderCreated.dataValues.user.email : 
                    orderCreated.dataValues.email

    if (process.env?.TEST !== "SI")
      sendEmail(
        email, 
        "Sheerex: Order Registered", 
      `Order: ${orderCreated.dataValues.id}
       Operation: ${orderCreated.dataValues.operation} ${orderCreated.dataValues.type ? "Type: " + orderCreated.dataValues.type : ""}
       Amount: ${orderCreated.dataValues.amount}
       Currency: ${orderCreated.dataValues.currency.name}
       ${orderCreated.dataValues.currency2?.name ? "Currency To: " + orderCreated.dataValues.currency2.name : ""}
      `)

    return orderCreated
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}

export async function updateOrder(updatedOrder) {
  try {
    checkNotEmpty(updatedOrder, ["id"], true)
    checkNotEmpty(updatedOrder, ["state", "comments"], false)
  
    const order = await Order.findByPk(updatedOrder.id)
    if (!order)
      throw {status: 404, message:  "Order Does Not Exist."} 

    Object.assign(order, updatedOrder)  
    await order.save()

    return order
  } catch (error) {
    throw {status: error?.status || 500, message: error.message}
  }
}