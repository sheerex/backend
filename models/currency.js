import { DataTypes } from "sequelize"
import { database } from "../database/database.js"

export const Currency = database.define('currencies', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING
  }
},{
  defaultScope: {
    attributes: {exclude: ["createdAt", "updatedAt"]}
  }
})
