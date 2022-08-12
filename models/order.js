import { DataTypes, Sequelize } from "sequelize"
import { database } from "../database/database.js"
import { Operations, States, Types } from "./enum.js";

export const Order = database.define('orders', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn("NOW")
  },
  operation: {
    type: DataTypes.ENUM(Operations.Deposit, Operations.Swap, Operations.Withdraw),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(Types.Limit, Types.Market),
    validate: {
      shouldBeSetIfSwap(value) {
        if (this.operation === 'Swap' && (typeof value !== 'string' || value.trim().length === 0)) {
          throw new Error('Type must be set when operation is Swap.');
        }
      }
    }
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    validate: {min: 0},
    get() {
      const rawValue = this.getDataValue('amount')
      return parseFloat(rawValue)
    }
  },
  price: {
    type: DataTypes.DECIMAL,
    validate: {
      shouldBeSetIfSwap(value) {
        if (this.operation === 'Swap' && (typeof value !== 'number' || value <= 0)) {
          throw new Error('Price must be set when operation is Swap.');
        }
      }
    },
    get() {
      const rawValue = this.getDataValue('price')
      return parseFloat(rawValue)
    }
  },
  state: {
    type: DataTypes.ENUM(States.Pending, States.Completed, States.Canceled),
    defaultValue: States.Pending,
    allowNull: false
  },
  comments: {
    type: DataTypes.STRING(1000)
  },
  contact: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    validate: {isEmail: true}
  }
},{
  defaultScope: {
    attributes: {exclude: ["createdAt", "updatedAt"]}
  }
})
