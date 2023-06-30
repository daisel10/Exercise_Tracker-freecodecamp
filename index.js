const express = require('express')
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

// Objeto para almacenar los datos
const database = {
  users: [],
  exercises: []
};

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;

  // Verificar si el usuario ya existe
  const existingUser = database.users.find(user => user.username === username);
  if (existingUser) {
    return res.send('Username already exists');
  }

  // Crear nuevo usuario
  const newUser = {
    username,
    _id: generateId()
  };

  database.users.push(newUser);

  res.json({ username: newUser.username, _id: newUser._id });
});

app.get('/api/exercise/users', (req, res) => {
  res.json(database.users);
});

app.post('/api/exercise/add', (req, res) => {
  const { userId, description, duration, date } = req.body;

  // Verificar si el usuario existe
  const user = database.users.find(user => user._id === userId);
  if (!user) {
    return res.send('User not found');
  }

  // Crear nuevo ejercicio
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
    _id: userId
  });
});

app.get('/api/exercise/log', (req, res) => {
  const { userId, from, to, limit } = req.query;

  // Verificar si el usuario existe
  const user = database.users.find(user => user._id === userId);
  if (!user) {
    return res.send('User not found');
  }

  let exercises = database.exercises.filter(exercise => exercise.username === user.username);

  // Filtrar por fechas (from y to)
  if (from) {
    exercises = exercises.filter(exercise => exercise.date >= new Date(from));
  }
  if (to) {
    exercises = exercises.filter(exercise => exercise.date <= new Date(to));
  }

  // Limitar cantidad de ejercicios (limit)
  if (limit) {
    exercises = exercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: exercises.length,
    _id: userId,
    log: exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }))
  });
});

// Generar un ID único
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
