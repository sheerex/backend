import { DataTypes } from "sequelize"
import { database } from "../database/database.js"

export const Price = database.define('prices', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    validate: {min: 0},
    get() {
      const rawValue = this.getDataValue('price')
      return parseFloat(rawValue)
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
},{
  defaultScope: {
    attributes: {exclude: ["createdAt", "updatedAt"]}
  }
})