import { Balance } from "./balance.js"
import { Currency } from "./currency.js"
import { Order } from "./order.js"
import { Parameter } from "./parameter.js"
import { Price } from "./price.js"
import { User } from "./user.js"

User.belongsToMany(Currency, { through: Balance, allowNull: false })
Currency.belongsToMany(User, { through: Balance, allowNull: false })

User.hasMany(Balance, { foreignKey: {allowNull: false }})
Balance.belongsTo(User, { foreignKey: {allowNull: false }})
Currency.hasMany(Balance, { foreignKey: {allowNull: false }})
Balance.belongsTo(Currency, { foreignKey: {allowNull: false }})


Currency.belongsToMany(Currency, {as: "currency", through: Price, foreignKey: {name: 'currencyId', allowNull: false }})
Currency.belongsToMany(Currency, {as: "currency2", through: Price, foreignKey: {name: 'currency2Id', allowNull: false }})
Currency.hasMany(Price, { foreignKey: {name: 'currencyId', allowNull: false }})
Currency.hasMany(Price, { foreignKey: {name: 'currency2Id', allowNull: false }})
Price.belongsTo(Currency, { as: "currency", foreignKey: {name: 'currencyId', allowNull: false }})
Price.belongsTo(Currency, { as: "currency2", foreignKey: {name: 'currency2Id', allowNull: false }})

Currency.hasMany(Order, { foreignKey: {allowNull: false }})
Currency.hasMany(Order, { foreignKey: {name: 'currency2Id' }})
User.hasMany(Order, {as: "orders", foreignKey: {name: 'userId' }})
User.hasMany(Order, {as: "ordersOperated", foreignKey: {name: 'operatorId' }})
Order.belongsTo(Currency, { as: "currency"})
Order.belongsTo(Currency, { as: "currency2", foreignKey: {name: 'currency2Id'}})
Order.belongsTo(User, {as: "user", foreignKey: {name: 'userId' }})
Order.belongsTo(User, {as: "operator", foreignKey: {name: 'operatorId' }})

export {
  Balance,
  Currency,
  Order,
  Parameter,
  Price,
  User
}