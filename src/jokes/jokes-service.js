const JokesService = {
    getAllJokes(knex) {
      return knex.select('*').from('jokes')
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
    },
  }
  
  module.exports = JokesService