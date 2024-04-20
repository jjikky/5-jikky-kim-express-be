const express = require('express');
const { register, login, isNicknameExist, isEmailExist } = require('../controllers/authController');
const { getSingleUser } = require('../controllers/userController');
const { uploadAvatar } = require('../utils/multer');
const userRouter = express.Router();

// authController
userRouter.post('/register', uploadAvatar.single('avatar'), register);
userRouter.post('/login', login);
userRouter.get('/nickname/check', isNicknameExist);
userRouter.get('/email/check', isEmailExist);

userRouter.get('/:id', getSingleUser);

module.exports = userRouter;
