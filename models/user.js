import { DataTypes } from "sequelize"
import { database } from "../database/database.js"

export const User = database.define('users', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      // We require usernames to have length of at least 3, and
      // only use letters, numbers and underscores.
      is: /^\w{3,}$/
    }    
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {isEmail: true}
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isAdmin:  {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  depositLimit: {
    type: DataTypes.DECIMAL,
    validate: {min: 0}
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  verificationCode: {
    type: DataTypes.INTEGER
  }
},{
  defaultScope: {
    attributes: {exclude: ["password", "verificationCode", "createdAt", "updatedAt"]}
  }
})



