import { Sequelize } from "sequelize"
import * as dotenv from 'dotenv'

dotenv.config()

const ssl = process.env.DB_SSL === "SI" ? {ssl: {require: true, rejectUnauthorized: false}} : {}

export const database = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: "ec2-54-152-28-9.compute-1.amazonaws.com", 
    dialect: 'postgres',
    dialectOptions: ssl
  }
)