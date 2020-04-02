const JokesService = {
  getAllJokes(knex) {
    return knex('jokes')
      .join('users', 'jokes.user_id', 'users.id')
      .select(
        'users.username',
        'jokes.id',
        'jokes.question',
        'jokes.answer',
        'jokes.rating',
        'jokes.date'
      )
      .orderBy('jokes.rating', 'desc')
  },
  insertJoke(knex, newJoke) {
    return knex
      .insert(newJoke)
      .into('jokes')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  insertUserJoke(knex, newJoke) {
    return knex
      .insert(newJoke)
      .into('jokes')
      .where('user_id', newJoke.user_id)
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  patchUpvote(knex, id) {
    return knex('jokes')
      .where('id', id)
      .increment('rating', 1)
  },
  patchDownvote(knex, id) {
    return knex('jokes')
      .where('id', id)
      .decrement('rating', 1)
  },
  getById(knex, id) {
    return knex
      .from('jokes')
      .select('*')
      .where('id', id)
      .first()
  },
  deleteJoke(knex, id) {
    return knex('jokes')
      .where({ id })
      .delete()
  }
}

module.exports = JokesService
