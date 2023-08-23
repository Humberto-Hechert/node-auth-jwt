import express from 'express'
import mongoose from 'mongoose'
import User from './models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const app = express()
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD

app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({ msg: "Home"})
})

//private route
app.get('/user/:id', checkToken, async (req, res) => {

    const id = req.params.id

    //check if user exists
    const user = await User.findById(id, '-password')

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado" })
    }

    res.status(200).json({ user })

})

function checkToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ msg: "Acesso negado!" })
    }

    try {
        
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()
    } catch (error) {
        
        console.log(error)
        res.status(400).json({ msg: 'Token Inválido' })
        
    }
}

//register user
app.post('/auth/register', async (req, res) => {
    const {name, email, password, confirmpassword} = req.body

    //validations
    if (!name) {
        res.status(422).json({ msg: "Nome precisar ser preenchido"})
    }

    if (!email) {
        res.status(422).json({ msg: "Email precisar ser preenchido"})
    }

    if (!password) {
        res.status(422).json({ msg: "Senha precisar ser preenchida"})
    }

    if (password !== confirmpassword) {
        res.status(422).json({ msg: "As senhas devem ser as mesmas"})
    }

    //check if user exists
    const userExists = await User.findOne({ email: email })

    if (userExists) {
        return res.status(422).json({ msg: "Email já cadastrado"})
    }

    //create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //create user

    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try{
        await user.save()
        res.status(201).json({ msg: "Usuário criado com sucesso!"})
    } catch(error){
        console.log(error)
        res.status(500).json({ msg: "Erro de servidor"})
    }
})

//Login user
app.post('/auth/login', async (req, res) => {

    const {email, password} = req.body

    if (!email) {
        res.status(422).json({ msg: "Email precisar ser preenchido"})
    }

    if (!password) {
        res.status(422).json({ msg: "Senha precisar ser preenchida"})
    }

    //check if user exists
    const user = await User.findOne({ email: email })

    if (!user) {
        res.status(422).json({ msg: "Usuário não encontrado" })
    }

    //check if password matches
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
        res.status(422).json({ msg: "Senha inválida" })
    }

    try {

        const secret = process.env.SECRET

        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        )

        res.status(200).json({ msg: "Autenticação realizada com sucesso", token})

    } catch (error){
        console.log(error)
        res.status(500).json({ msg: "Erro de servidor"})
    }


})

mongoose.
    connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.waxove8.mongodb.net/`)
    .then(() => {
        app.listen(5050)
        console.log("conectado ao banco de dados")
    })
    .catch((err) => console.log(err))

