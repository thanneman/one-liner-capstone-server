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
  date_created: new Date(user.date_created)
})

const serializeJoke = joke => ({
  id: joke.id,
  question: xss(joke.question),
  answer: xss(joke.answer),
  rating: joke.rating
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

    if (passwordError) return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithUserName(req.app.get('db'), email)
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` })

        return UsersService.hashPassword(password).then(hashedPassword => {
          const newUser = {
            email,
            username,
            password: hashedPassword
          }
          return UsersService.insertUser(req.app.get('db'), newUser).then(
            user => {
              res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(UsersService.serializeUser(user))
            }
          )
        })
      })
      .catch(next)
  })

// Individual users by id
usersRouter
  .route('/:user_id')
  .all((req, res, next) => {
    const { user_id } = req.params
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
    const { user_id } = req.params
    UsersService.deleteUser(req.app.get('db'), user_id)
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
    const { user_id } = req.params
    UsersService.getJokesById(req.app.get('db'), user_id)
      .then(joke => {
        if (!joke) {
          return res.status(404).json({ error: { message: `No jokes exist.` } })
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
    const { question, answer, rating } = req.body
    const newJoke = { question, answer, rating }

    for (const [key, value] of Object.entries(newJoke))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newJoke.user_id = req.user.id

    JokesService.insertUserJoke(req.app.get('db'), newJoke)
      .then(joke => {
        res.status(201).json(serializeJoke(joke))
      })
      .catch(next)
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { rating } = req.body
    const voteToUpdate = { rating }

    for (const [key, value] of Object.entries(voteToUpdate))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    voteToUpdate.user_id = req.user.id

    JokesService.insertUserJoke(req.app.get('db'), newJoke)
      .then(joke => {
        res.status(201).json(serializeJoke(joke))
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    const { user_id } = req.params
    UsersService.deleteUser(req.app.get('db'), user_id)
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
    JokesService.getById(req.app.get('db'), req.params.joke_id)
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
  // POST TRUE to upvotes table with user_id and joke_id
  /*.post(requireAuth, (req, res, next) => {
    const { user_id, joke_id } = req.body
    const newUpvote = { user_id, joke_id }
    console.log(newUpvote)
    for (const [key, value] of Object.entries(newUpvote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newUpvote.user_id = req.user.id

    UsersService.insertUserUpvote(req.app.get('db'), newUpvote)
      .then(upvote => {
        res.status(201).json(upvote)
      })
      .catch(next)
  })*/
  .delete((req, res, next) => {
    JokesService.deleteJoke(req.app.get('db'), req.params.joke_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

// GET upvoted joke IDs for current user
usersRouter
  .route('/:user_id/upvotes')
  .all(requireAuth)
  .all((req, res, next) => {
    const { user_id } = req.params
    UsersService.getUpvotesById(req.app.get('db'), user_id)
      .then(joke => {
        if (!joke) {
          return res.status(404).json({ error: { message: `No jokes exist.` } })
        }
        res.joke = joke
        next()
      })
      .catch(next)
  })
  .get((req, res) => {
    res.json(res.joke)
  })
  // POST TRUE to upvotes table with user_id and joke_id
  .post(requireAuth, (req, res, next) => {
    const { user_id, joke_id } = req.body
    const newUpvote = { user_id, joke_id }
    console.log(newUpvote)
    for (const [key, value] of Object.entries(newUpvote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newUpvote.user_id = req.user.id

    UsersService.insertUserUpvote(req.app.get('db'), newUpvote)
      .then(upvote => {
        res.status(201).json(upvote)
      })
      .catch(next)
  })

// GET upvoted joke IDs for current user
usersRouter
  .route('/:user_id/upvotes/:joke_id')
  .all(requireAuth)
  .all((req, res, next) => {
    const { user_id } = req.params
    UsersService.getUpvotesById(req.app.get('db'), user_id)
      .then(joke => {
        if (!joke) {
          return res.status(404).json({ error: { message: `No jokes exist.` } })
        }
        res.joke = joke
        next()
      })
      .catch(next)
  })
  .get((req, res) => {
    res.json(res.joke)
  })
  // POST TRUE to upvotes table with user_id and joke_id
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { joke_id } = req.body
    const newUpvote = { joke_id }
    console.log(newUpvote)
    for (const [key, value] of Object.entries(newUpvote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newUpvote.user_id = req.user.id

    UsersService.insertUserUpvote(req.app.get('db'), newUpvote)
      .then(upvote => {
        res.status(201).json(upvote)
      })
      .catch(next)
  })
/*
.post((req, res, next) => {
  const { joke_id } = req.params
  user_id = req.user.id
  console.log(joke_id, user_id)
  UsersService.insertUserUpvote(req.app.get('db'), joke_id, user_id)
    .then(upvote => {
      res.status(201).json(upvote)
    })
    .catch(next)
})*/

module.exports = usersRouter
