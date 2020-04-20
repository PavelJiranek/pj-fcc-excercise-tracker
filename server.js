'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const myApp = require('./myApp');
const utils = require('./utils');

const app = express();

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))

// log requests
app.use(({method, path}, res, next) => {
  console.log(`${method} ${path}`);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

/**
 * User endpoints
 */
app.post("/api/exercise/new-user", function (req, res, next) {
  const username = req.body.username;
  const user = myApp.createUser(username);
  myApp.saveAndSendUser(user, res, next);
});

app.get("/api/exercise/users", function (req, res, next) {
  myApp.getAllUsers((err, users) => {
    if (err) {
      return next(`Error when getting users: ${err}`);
    }
    res.json(users);
  })
});

app.get("/api/admin/dropUsers", function (req, res, next) {
  myApp.removeUsers((err, success) => {
    if (err) {
      return next(`Error when deleting users: ${err}`);
    }
    res.send(`Deleted ${success.deletedCount} users.`);
  })
});


/**
 * Exercise endpoints
 */
app.post("/api/exercise/add", function (req, res, next) {
  const exercise = myApp.createExercise(req.body);
  myApp.saveAndSendExercise(exercise, res, next);
});

app.get("/api/exercise/log", function (req, res, next) {
  myApp.getAndSendUserExercises(req.query, res, next)
});

app.get("/api/admin/dropExercises", function (req, res, next) {
  myApp.removeExercises((err, success) => {
    if (err) {
      return next(`Error when deleting exercises: ${err}`);
    }
    res.send(`Deleted ${success.deletedCount} exercises.`);
  })
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: 'No exercise here' })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port ' + listener.address().port)
})
