import express, { response } from "express"
import bcrypt from "bcrypt-nodejs"
import cors from "cors"
import knex from "knex"

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

app.get("/", (req, res) => {
    res.send("sucess")
})

app.post("/signin", (req, res) => {
    db.select("email", "hash").from("login")
        .where("email", "=", req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
            if (isValid) {
                db.select("*").from("users")
                    .where("email", "=", req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json("unable to get user"))
            } else {
                res.status(400).json("wrong credentials")
            }
        })
        .catch(err => res.status(400).json("wrong credentials"))
})

app.post("/register", (req, res) => {
    const { email, name, password } = req.body
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash,
            email
        })
            .into("login")
            .returning("email")
            .then(loginEmail => {
                return trx("users")
                    .returning("*")
                    .insert({
                        name,
                        email: loginEmail[0].email,
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0])
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json("unable to register"))
})

app.get("/profile/:id", (req, res) => {
    const { id } = req.params
    db.select("*").from("users").where({ id })
        .then(user => {
            user.length ? res.json(user[0]) : res.status(400).json("not found")
        })
        .catch(err => res.status(400).json("error getting user"))
})

app.put("/image", (req, res) => {
    const { id } = req.body
    db("users").where("id", "=", id)
        .increment("entries", 1)
        .returning("entries")
        .then(entries => {
            res.json(entries[0].entries)
        })
        .catch(err => {
            res.status(400).json("unable to get entries")
        })
})


// bcrypt.hash(password, null, null, function (err, hash) {
//     console.log(hash)
// });
// // Load hash from your password DB.


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