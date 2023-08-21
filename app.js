import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const app = express()
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD

app.get('/', (req, res) => {
    res.status(200).json({ msg: "Home"})
})

mongoose.
    connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.waxove8.mongodb.net/`)
    .then(() => {
        app.listen(5050)
        console.log("conectado ao banco de dados")
    })
    .catch((err) => console.log(err))

