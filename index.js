const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

// Objeto para almacenar los datos
const database = {
  users: [],
  exercises: []
};

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post('/api/users', (req, res) => {

  const { username } = req.body;


  // Check if the username is already taken
  const existingUser = database.users.find(user => user.username === username);
  if (existingUser) {
    return res.send('Username already exists');
  }

  // Create a new user
  const newUser = {
    username,
    _id: generateId()
  };

  database.users.push(newUser);

  res.json({ username: newUser.username, _id: newUser._id });
});

app.get('/api/users', (req, res) => {
  res.json(database.users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  // Check if the user exists
  const user = database.users.find(user => user._id === _id);
  if (!user) {
    return res.send('User not found');
  }

  // Create a new exercise
  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date(),
    _id: generateId()
  };

  database.exercises.push(newExercise);

  res.json({
    username: newExercise.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date.toDateString(),
    _id
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  // Check if the user exists
  const user = database.users.find(user => user._id === _id);
  if (!user) {
    return res.send('User not found');
  }

  let exercises = database.exercises.filter(exercise => exercise.username === user.username);

  // Filter by dates (from and to)
  if (from) {
    exercises = exercises.filter(exercise => exercise.date >= new Date(from));
  }
  if (to) {
    exercises = exercises.filter(exercise => exercise.date <= new Date(to));
  }

  // Limit the number of exercises (limit)
  if (limit) {
    exercises = exercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: exercises.length,
    _id,
    log: exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }))
  });
});

// Generate a unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
