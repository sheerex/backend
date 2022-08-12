import { DataTypes } from "sequelize"
import { database } from "../database/database.js"

export const Network = database.define('networks', {
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
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
},{
  defaultScope: {
    attributes: {exclude: ["createdAt", "updatedAt"]}
  }
})