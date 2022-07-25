import { DataTypes } from "sequelize"
import { database } from "../database/database.js"

export const Balance = database.define('balances', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  balance: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    validate: {min: 0}
  }
},{
  defaultScope: {
    attributes: {exclude: ["createdAt", "updatedAt"]}
  }
})