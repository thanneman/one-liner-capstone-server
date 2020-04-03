const path = require('path');
const express = require('express');
const xss = require('xss');
const JokesService = require('./jokes-service');
const { requireAuth } = require('../middleware/jwt-auth');

const jokesRouter = express.Router();
const jsonParser = express.json();

const serializeJoke = joke => ({
  id: joke.id,
  question: xss(joke.question),
  answer: xss(joke.answer),
  rating: joke.rating
});

// All users GET, POST
jokesRouter
  .route('/')
  .get((req, res, next) => {
    JokesService.getAllJokes(req.app.get('db'))
      .then(jokes => {
        res.json(jokes);
      })
      .catch(next);
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { question, answer, rating } = req.body;
    const newJoke = { question, answer, rating };

    for (const [key, value] of Object.entries(newJoke))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });

    newJoke.user_id = req.user.id;
    newJoke.rating = 1;

    JokesService.insertUserJoke(req.app.get('db'), newJoke)
      .then(joke => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${joke.id}`))
          .json(serializeJoke(joke));
      })
      .catch(next);
  });

jokesRouter
  .route('/:joke_id')
  .all(requireAuth)
  .all((req, res, next) => {
    JokesService.getById(req.app.get('db'), req.params.joke_id)
      .then(joke => {
        if (!joke) {
          return res.status(404).json({
            error: { message: `Joke does not exist` }
          });
        }
        res.joke = joke;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeJoke(res.joke));
  })
  .delete((req, res, next) => {
    JokesService.deleteJoke(req.app.get('db'), req.params.joke_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

// PATCH to increment jokes vote count
jokesRouter
  .route('/upvote/:joke_id')
  .all(requireAuth)
  .patch((req, res, next) => {
    JokesService.patchUpvote(req.app.get('db'), req.params.joke_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

// PATCH to decrement jokes vote count
jokesRouter
  .route('/downvote/:joke_id')
  .all(requireAuth)
  .patch((req, res, next) => {
    JokesService.patchDownvote(req.app.get('db'), req.params.joke_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = jokesRouter;
