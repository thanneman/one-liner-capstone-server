const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', function() {
  let db;

  let testUsers = [
    {
      id: 1,
      username: 'kpassarella',
      email: 'demo@test.com',
      password: 'password'
    },
    {
      id: 2,
      username: 'dexner',
      email: 'demo@test.com',
      password: 'password'
    },
    {
      id: 3,
      username: 'mghere',
      email: 'demo@test.com',
      password: 'password'
    }
  ];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () =>
    db.raw(`TRUNCATE jokes, users RESTART IDENTITY CASCADE`)
  );

  before('insert users', () => db.into('users').insert(testUsers));

  afterEach('clean the table', () =>
    db.raw(`TRUNCATE jokes, users RESTART IDENTITY CASCADE`)
  );
});
