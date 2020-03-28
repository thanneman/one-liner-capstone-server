# one-liner-capstone-server

One-liner is a comical community to post and rate the best jokes.

## Working Prototype
[Sever Repo](https://github.com/thanneman/one-liner-capstone-server)

[React Client Repo](https://github.com/thanneman/one-liner-capstone-client)

[Live App](https://one-liner-gray.now.sh/)

## User Stores
This app has two types of users; visitor and logged-in user

#### Landing Page
* As a visitor
* I want to understand what the app is and what I can do with it
* Sign up or log in

#### Sign Up
* As a visitor
* I want to register to use this app
* So I can add jokes and have the community rate them

#### View All Jokes
* As a logged-in user
* I want to see all jokes from the community
* I want to to be able to upvote/downvote jokes

#### View My Jokes
* As a logged-in user
* I want to see only jokes
* I want to be able to delete only my jokes

#### New Joke
* As a logged-in user
* I want to add a new joke
* So I can have the cummunity rate my joke

## Screenshots

### **Landing Page**
#### GET `api/jokes`
<img src="/github-images/landing.png" alt="Landing Page">

### **Login Page**
#### POST `api/auth/login`
<img src="/github-images/login.png" alt="Landing Page">

### **Sign Up Page**
#### POST `api/users`
<img src="/github-images/signup.png" alt="Sign Up Page">

### **Dashboard (All Jokes)**
#### GET `api/jokes`
#### PATCH `api/upvote/jokes/:joke_id`
#### PATCH `api/downvote/jokes/:joke_id`
<img src="/github-images/dashboard.png" alt="Dashboard Page">

### **User Jokes**
#### GET `api/users/:user_id/jokes`
#### DELETE `api/user/:user_id/joke/:joke`
<img src="/github-images/userjokes.png" alt="User Jokes Page">

### **Add New Joke**
#### POST `api/users/:user_id/jokes`
<img src="/github-images/newjoke.png" alt="Add Joke Page">

## API Documentation

### Users Endpoints
`/users/:user_id` endpoints require an `authorization` header with value of `bearer YOUR_AUTH_TOKEN_HERE` which is assigned to the user after signing up for an account.

### POST `api/users`
Adds a new user to the user database and allows them to use their account to track the data they input. 

### POST `api/auth/login`
Allows a user in the database to login with the proper credentials. Returns the authToken and userId which allows them access to their information `/users/:user_id` endpoints as below.

### GET `api/users/:user_id/jokes`
Allows a logged-in user to access all of their jokes they have entered by returning an array of the data.

**Example response**
```JSON
[
    {
        "id": 24,
        "user_id": 5,
        "username": "demouser",
        "question": "Post Malone has canceled his tour.",
        "answer": "Does this now make him Postpone Malone?",
        "rating": 8,
        "date": "2020-02-07 15:33:49",
    }
]
```

### DELETE `api/users/:user_id/jokes/:joke_id`
Allows a logged-in user to delete a joke using the `joke_id` of the corresponding joke.

A successful `DELETE` responds with `204 No Content`.

### POST `api/users/:user_id/jokes`
Allows a logged-in user to add a joke with their relevant data.

**Example request body**
```JSON
[
    {
        "question": "Post Malone has canceled his tour.",
        "answer": "Does this now make him Postpone Malone?",
        "rating": 1,
    }
]
```
**Example response body**
```JSON
[
    {
        "id": 24,
        "user_id": 5,
        "username": "demouser",
        "question": "Post Malone has canceled his tour.",
        "answer": "Does this now make him Postpone Malone?",
        "rating": 1,
        "date": "2020-02-07 15:33:49",
    }
]
```

## Business Objects (database structure)
* User
    * user id
    * email
    * username
    * password (at least 7-20 char and a number)
    * date created

* Jokes
    * joke id
    * user id
    * question
    * answer
    * rating
    * date

## Technology
* Front-End: HTML5, CSS3, JavaScript, React.js
* Back-End: Node.js, Express.js, PostgreSQL, Mocha and Chai
* Development Enviroment: ZEIT & Heroku

## Responsive
App is built to be usable on mobile devices, as well as responsive across mobile, tablet, laptop, and desktop screen resolutions.

## Scripts
Install node modules `npm install`

Run the tests `npm test`

Start the application `npm start`