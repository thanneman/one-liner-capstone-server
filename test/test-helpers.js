const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'cwelch',
      email: 'demo@demo.com',
      password: 'Thinkful1!',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      username: 'zhenderson',
      email: 'demo2@demo.com',
      password: 'Thinkful1!',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      username: 'lknox',
      email: 'demo3@demo.com',
      password: 'Thinkful1!',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    }
  ];
}

function makeJokesArray() {
  return [
    {
      user_id: 1,
      question: 'Test',
      answer: 'Test Answer',
      rating: '1',
      date: '2029-01-22T16:28:32.615Z'
    }
  ];
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.into('users').insert([users]);
}

function seedTables(db, jokes) {
  return db.into('jokes').insert([jokes]);
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256'
  });
  return `bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  seedUsers,
  makeJokesArray,
  seedTables,
  makeAuthHeader
};
