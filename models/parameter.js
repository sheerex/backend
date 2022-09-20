import { DataTypes } from "sequelize"
import { database } from "../database/database.js"

export const Parameter = database.define('parameters', {
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
  value: {
    type: DataTypes.STRING(5000),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  }
})