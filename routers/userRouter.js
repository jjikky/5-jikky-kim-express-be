const express = require('express');
const { register, login } = require('../controllers/authController');
const userRouter = express.Router();

userRouter.post('/login', login);

// authController
userRouter.post('/register', register);
userRouter.post('login', login);

module.exports = userRouter;
