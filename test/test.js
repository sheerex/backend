import chai from "chai"
import fetch from 'node-fetch'
import fs from 'fs'
import { database } from "../database/database.js"
import { Balance, Currency, Network, Order, Parameter, Price, User } from "../models/index.js"


describe("GENERAL", () => {
  before(async () => {
    await User.sync({ force: true})
    await Currency.sync({ force: true})
    await Balance.sync({ force: true})
    await Price.sync({ force: true})
    await Order.sync({ force: true})
    await Parameter.sync({ force: true})
    
    const sql = fs.readFileSync('scripts/script.sql', 'utf8');
    await database.query(sql)  
    
    await database.query(
      `insert into users ("username","email","password","isAdmin","depositLimit","verified","active","verificationCode","createdAt","updatedAt") 
      values ('admin', 'admin@sheerex.com','admin', true, null, true, true, null, now(), now())`)

    process.env.TOKEN_EXPIRATION = "1h"  
  })

  let tokenAdmin = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjU3NDc0OTE3LCJleHAiOjE2NjUyNTA5MTd9.gykPWFaZLlrhuZiFbrVbeVdUh_XQLVjNS3F0a9v1qfM"
  let tokenNoAdmin2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjU3NDc1MDc1LCJleHAiOjE2NjUyNTEwNzV9.ydit-BU9fHz-AhW7WkoGf0nvtTI55HMCWploSye6Z5k"
  let tokenNoAdmin3 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNjU3NDc4OTQyLCJleHAiOjE2NjUyNTQ5NDJ9.mGPrOq66u2JJgweGufjTHMKizAdMU9bzquoE5-E6gf4"
  
  // it("Login", async () => {
  //   const loginBody = {
  //     "email": "admin@sheerex.com",
  //     "password": "admin"      
  //   }
  //   const response = await fetch('http://localhost:5555/users/login', 
  //     {method: 'POST', body: JSON.stringify(loginBody), headers: {'Content-Type': 'application/json'}})
  //   const responseJSON = await response.json()
  //   expect(response.status).toBe(400);
  //   tokenAdmin = responseJSON.token
  //  })

  it("Should not Login with wrong password", async () => {
    const loginBody = {
      "email": "admin@sheerex.com",
      "password": "admin2"      
    }
    const expected = {
      "message": "Invalid Credentials."
    }
    const response = await fetch('http://localhost:5555/users/login', 
      {method: 'POST', body: JSON.stringify(loginBody), headers: {'Content-Type': 'application/json'}})
    chai.expect(response.status).to.equal(401);
    chai.expect(await response.json()).to.deep.equal(expected) 
   })

  it("Should GET User 1 with admin token", async () => {
    const expected = {
      "id": 1,
      "username": "admin",
      "email": "admin@sheerex.com",
      "isAdmin": true,
      "depositLimit": null,
      "verified": true,
      "active": true
    }
    const response = await fetch('http://localhost:5555/users/1', 
      {method: 'GET', headers: {"x-access-token": tokenAdmin}})
    chai.expect(response.status).to.equal(200)
    chai.expect(await response.json()).to.deep.equal(expected) 
  })  

  it("Should not GET User 1 with user token", async () => {
    const expected = {
      "message": "User is not Admin and can only get its own profile."
    }
    const response = await fetch('http://localhost:5555/users/1', 
      {method: 'GET', headers: {"x-access-token": tokenNoAdmin2}})
    chai.expect(response.status).to.equal(403)
    chai.expect(await response.json()).to.deep.equal(expected) 
  })  

  it("Should POST User", async () => {
    const newUser = {
        "username": "juan",
        "email": "juan@gmail.com",
        "password": "123"
    }
    const expected = {
      "id": 2,
      "username": "juan",
      "email": "juan@gmail.com",
      "isAdmin": false,
      "verified": false,
      "active": true,
      "depositLimit": null
    }    
    const response = await fetch('http://localhost:5555/users', {
      method: 'POST', 
      body: JSON.stringify(newUser),
      headers: {
        "x-access-token": tokenAdmin,
        "Content-Type": "application/json"
      }
    })
    chai.expect(response.status).to.equal(201)
    chai.expect(await response.json()).to.deep.equal(expected) 
  })


  it("Should not POST User with empty username", async () => {
    const newUser = {
        "username": "",
        "email": "juan@gmail.com",
        "password": "123"
    }
    const expected = {
      "message": "username is required."
    }    
    const response = await fetch('http://localhost:5555/users', {
      method: 'POST', 
      body: JSON.stringify(newUser),
      headers: {
        "x-access-token": tokenAdmin,
        "Content-Type": "application/json"
      }
    })
    chai.expect(response.status).to.equal(422)
    chai.expect(await response.json()).to.deep.equal(expected) 
  })  

  it("Should not POST User with empty email", async () => {
    const newUser = {
        "username": "edu",
        "email": "",
        "password": "123"
    }
    const expected = {
      "message": "email is required."
    }    
    const response = await fetch('http://localhost:5555/users', {
      method: 'POST', 
      body: JSON.stringify(newUser),
      headers: {
        "x-access-token": tokenAdmin,
        "Content-Type": "application/json"
      }
    })
    chai.expect(response.status).to.equal(422)
    chai.expect(await response.json()).to.deep.equal(expected) 
  })  
  
  it("Should not POST User with empty password", async () => {
    const newUser = {
        "username": "edu",
        "email": "juan@gmail.com",
        "password": ""
    }
    const expected = {
      "message": "password is required."
    }    
    const response = await fetch('http://localhost:5555/users', {
      method: 'POST', 
      body: JSON.stringify(newUser),
      headers: {
        "x-access-token": tokenAdmin,
        "Content-Type": "application/json"
      }
    })
    chai.expect(response.status).to.equal(422)
    chai.expect(await response.json()).to.deep.equal(expected) 
  })  

   it("Should GET Users", async () => {
    const expected = [{
      "id": 1,
      "username": "admin",
      "email": "admin@sheerex.com",
      "isAdmin": true,
      "depositLimit": null,
      "verified": true,
      "active": true
    },
    {
      "id": 2,
      "username": "juan",
      "email": "juan@gmail.com",
      "isAdmin": false,
      "verified": false,
      "active": true,
      "depositLimit": null
    }]
    const response = await fetch('http://localhost:5555/users/', 
      {method: 'GET', headers: {"x-access-token": tokenAdmin}})
    chai.expect(response.status).to.equal(200)
    chai.expect(await response.json()).to.deep.equal(expected) 
   })


})