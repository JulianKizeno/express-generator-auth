const express = require("express")
const router = express.Router()

// Reject structured query operators before authentication or database lookups.
router.use(['/login', '/signup'], (req, res, next) => {
    if (req.method !== 'POST') return next()
    const body = req.body || {}
    if (typeof body.username !== 'string' || !body.username.trim() ||
        body.username.length > 128 || typeof body.password !== 'string' ||
        !body.password || Buffer.byteLength(body.password, 'utf8') > 72) {
        return res.status(400).json({ message: 'Invalid credentials format' })
    }
    return next()
})

const passport = require("passport")

const User = require("../models/user.model")

const bcrypt = require("bcrypt")
const bcryptSalt = 10


// User signup
router.get("/signup", (req, res) => res.render("auth/signup"))
router.post("/signup", (req, res, next) => {

    const { username, password } = req.body

    if (!username || !password) {
        res.render("auth/signup", { errorMsg: "Rellena el usuario y la contraseña" })
        return
    }

    User.findOne({ username })
        .then(user => {
            if (user) {
                res.render("auth/signup", { errorMsg: "El usuario ya existe en la BBDD" })
                return
            }
            const salt = bcrypt.genSaltSync(bcryptSalt)
            const hashPass = bcrypt.hashSync(password, salt)

            User.create({ username, password: hashPass })
                .then(() => res.redirect("/"))
                .catch(() => res.render("auth/signup", { errorMsg: "No se pudo crear el usuario" }))
        })
        .catch(error => next(error))
})


// User login
router.get('/login', (req, res) => res.render('auth/login', { "errorMsg": req.flash("error") }))
router.post('/login', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true,
    badRequestMessage: 'Rellena todos los campos'
}))


// User logout
router.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) return next(err)
        res.redirect("/login")
    })
})

module.exports = router