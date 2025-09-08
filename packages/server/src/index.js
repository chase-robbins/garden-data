const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { verifyToken } = require('./auth-middleware');
const { db } = require('./firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express server!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'This is a protected route!', 
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name
    }
  });
});

// User profile endpoint
app.get('/api/user', verifyToken, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name,
    picture: req.user.picture
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});