import { Network, Order, User } from "../models/index.js"
import { parseQueryParams } from "../helpers/queryParams.js"
import { sendEmail } from "../helpers/sendEmail.js"
import { checkNotEmpty } from "../helpers/validations.js"
import { Operations, States, Types } from "../models/enum.js";
import * as networkService from "../services/network.js"
import * as priceService from "../services/price.js"
import * as parameterService from "../services/parameter.js"

export async function getOrders(queryObject) {
    try {
      const { filterObject, sortingArray, limit, offset } = parseQueryParams(queryObject)
      const orders = await Order.findAll({
        include: ["user", "currency", "currency2", "operator", Network], 
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
      include: ["user", "currency", "currency2", "operator", Network], 
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
      checkNotEmpty(newOrder, ["type", "currency2Id", "networkId"], true)
      if (newOrder.type === Types.Limit)
        checkNotEmpty(newOrder, ["price"], true)
      const network = await networkService.getNetwork(newOrder.networkId)
      if (!network.active)
        throw {status: 409, message: "Network is not active."}
      if (newOrder.type === Types.Market) {
        const price = await priceService.getPriceByCurrencies(newOrder.currencyId, newOrder.currency2Id)
        if (!price.currency.active)
          throw {status: 409, message: `Currency ${price.currency.name} is not active.`}
        if (!price.currency2.active)
          throw {status: 409, message: `Currency ${price.currency2.name} is not active.`}
        if (!price.active)
          throw {status: 409, message: "Price is not active."}
        newOrder.price = price.price
      }
    }

    if (newOrder.operation === Operations.Deposit || newOrder.operation === Operations.Withdraw) {
      delete newOrder.type
      delete newOrder.price
      delete newOrder.currency2Id
    }
    
    delete newOrder.state
    
    const order = await Order.create(newOrder)

    delete order.dataValues.createdAt
    delete order.dataValues.updatedAt

    const orderCreated = await Order.findOne({
      include: ["user", "currency", "currency2", "operator", "network"], 
      where: {id: order.dataValues.id}
    })

    if (process.env?.TEST !== "SI") {
      const email = orderCreated.dataValues.user?.email ? 
      orderCreated.dataValues.user.email : 
      orderCreated.dataValues.email

      const payment = await parameterService.getParameters({id: "1"})
      const paymentInfo = payment[0].toJSON().value
      console.log(paymentInfo);
      
      sendEmail(
        email, 
        "Sheerex: Orden Registrada", 
        `Orden: ${orderCreated.dataValues.id}
Operación: ${orderCreated.dataValues.operation} ${orderCreated.dataValues.type ? "Tipo: " + orderCreated.dataValues.type : ""}
Monto: ${orderCreated.dataValues.amount}
Moneda Origen: ${orderCreated.dataValues.currency.name}
${orderCreated.dataValues.currency2?.name ? "Moneda Destino: " + orderCreated.dataValues.currency2.name : ""}
${paymentInfo}
        `)
      }

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