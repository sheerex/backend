import { Sequelize } from "sequelize"
import * as dotenv from 'dotenv'

dotenv.config()

const DB_SSL  = process.env?.TEST === "SI" ? process.env.TESTDB_SSL  : process.env.DB_SSL
const DB_NAME = process.env?.TEST === "SI" ? process.env.TESTDB_NAME : process.env.DB_NAME
const DB_USER = process.env?.TEST === "SI" ? process.env.TESTDB_USER : process.env.DB_USER
const DB_PASS = process.env?.TEST === "SI" ? process.env.TESTDB_PASS : process.env.DB_PASS
const DB_HOST = process.env?.TEST === "SI" ? process.env.TESTDB_HOST : process.env.DB_HOST
const DB_PORT = process.env?.TEST === "SI" ? process.env.TESTDB_PORT : process.env.DB_PORT

const ssl = DB_SSL === "SI" ? {ssl: {require: true, rejectUnauthorized: false}} : {}

console.log("Connecting to DB:", DB_NAME, "on:", DB_HOST)

export const database = new Sequelize(
  DB_NAME, 
  DB_USER, 
  DB_PASS, 
  {
    host:  DB_HOST, 
    port: DB_PORT,
    dialect: 'postgres',
    dialectOptions: ssl,
  }
)