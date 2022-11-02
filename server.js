import express, { response } from "express"
import bcrypt from "bcrypt-nodejs"
import cors from "cors"
import knex from "knex"

import handleRegister from "./controllers/register.js"
import handleSignIn from "./controllers/signin.js"
import handleProfileGet from "./controllers/profile.js"
import handleImage from "./controllers/image.js"

const db = knex({
    client: "pg",
    connection: {
        host: "127.0.0.1",
        port: 5432,
        user: "postgres",
        password: "formalIN",
        database: "smart-brain"
    }
});

const app = express()

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => res.send("sucess"))
app.post("/signin", (req, res) => handleSignIn(req, res, db, bcrypt))
app.post("/register", (req, res) => handleRegister(req, res, db, bcrypt))
app.get("/profile/:id", (req, res) => handleProfileGet(req, res, db))
app.put("/image", (req, res) => handleImage(req, res, db))

app.listen(3001, () => {
    console.log("app is running")
})

/*
PLANNING the app:
 / --> res = this is working 
 /signin --> POST = success / fail
 /register --> POST = user
 /profile/:userId --> GET = user
 /image --> PUT --> user 

 */