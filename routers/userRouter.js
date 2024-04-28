const express = require('express');
const {
    register,
    login,
    logout,
    isNicknameExist,
    isEmailExist,
    changePassword,
    updateUser,
    deleteUser,
} = require('../controllers/authController');
const { getSingleUser } = require('../controllers/userController');
const { isLoggedIn, isNotLoggedIn, autoLogin } = require('../utils/middlewares');
const { uploadAvatar } = require('../utils/multer');
const userRouter = express.Router();

// authController
userRouter.post('/register', isNotLoggedIn, uploadAvatar.single('avatar'), register);
userRouter.post('/login', isNotLoggedIn, login);
userRouter.get('/login/auto', autoLogin);
userRouter.get('/logout', isLoggedIn, logout);
userRouter.get('/nickname/check', isNicknameExist);
userRouter.get('/email/check', isEmailExist);
userRouter.patch('/password/change', isLoggedIn, changePassword);
userRouter.patch('/', isLoggedIn, uploadAvatar.single('avatar'), updateUser);
userRouter.delete('/', isLoggedIn, deleteUser);

userRouter.get('/change', isLoggedIn, getSingleUser);

module.exports = userRouter;
