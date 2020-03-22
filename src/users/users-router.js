const express = require('express')
const xss = require('xss')
const path = require('path')
const usersRouter = express.Router()
const jsonBodyParser = express.json()
const UsersService = require('./users-service')
const JokesService = require('../jokes/jokes-service')
const { requireAuth } = require('../middleware/jwt-auth')

const jsonParser = express.json()

const serializeUser = user => ({
    user_id: user.id,
    username: xss(user.username),
    email: xss(user.email),
    password: xss(user.password),
    date_created: new Date(user.date_created),
})

const serializeJoke = joke => ({
    id: joke.id,
    question: xss(joke.question),
    answer: xss(joke.answer),
    rating: joke.rating,
  })

// All users
usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                res.json(users.map(serializeUser))
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { email, username, password } = req.body
        for (const field of ['email', 'username', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Email or password required`
                })
        const passwordError = UsersService.validatePassword(password)

        if (passwordError)
            return res.status(400).json({ error: passwordError })

        UsersService.hasUserWithUserName(
            req.app.get('db'),
            email
        )
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({ error: `Username already taken` })

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            email,
                            username,
                            password: hashedPassword,
                        }
                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })

// Individual users by id
usersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        const { user_id } = req.params;
        UsersService.getById(req.app.get('db'), user_id)
            .then(user => {
                if (!user) {
                    return res
                        .status(404)
                        .send({ error: { message: `User does not exist.` } })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(UsersService.serializeUser(res.user))
    })
    .delete((req, res, next) => {
        const { user_id } = req.params;
        UsersService.deleteUser(
            req.app.get('db'),
            user_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

// Individual user, all jokes -- GET (all), POST, DELETE
usersRouter
    .route('/:user_id/jokes')
    .all(requireAuth)
    .all((req, res, next) => {
        const { user_id } = req.params;
        UsersService.getJokesById(req.app.get('db'), user_id)
            .then(joke => {
                if (!joke) {
                    return res
                        .status(404).json({ error: { message: `No jokes exist.` } })
                }
                res.joke = joke
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(res.joke)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { question, answer, rating = 0 } = req.body
        const newJoke = { question, answer }

        for (const [key, value] of Object.entries(newJoke))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        newJoke.user_id = req.user.id

        JokesService.insertUserJoke(
            req.app.get('db'),
            newJoke
        )
            .then(joke => {
                res
                    .status(201)
                    .json(serializeJoke(joke))
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        const { user_id } = req.params;
        UsersService.deleteUser(
            req.app.get('db'),
            user_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

// Individual user, individual joke -- GET (joke by id), DELETE (joke by id)
usersRouter
    .route('/:user_id/joke/:joke')
    .all(requireAuth)
    .all((req, res, next) => {
        JokesService.getById(
            req.app.get('db'),
            req.params.joke_id
        )
            .then(joke => {
                if (!joke) {
                    return res.status(404).json({
                        error: { message: `Joke does not exist` }
                    })
                }
                res.joke = joke
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(res.joke)
    })
    .delete((req, res, next) => {
        JokesService.deleteJoke(
            req.app.get('db'),
            req.params.joke_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = usersRouter