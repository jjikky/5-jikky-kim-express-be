const express = require('express');
const {
    register,
    login,
    isNicknameExist,
    isEmailExist,
    changePassword,
    protect,
    updateUser,
    deleteUser,
} = require('../controllers/authController');
const { getSingleUser } = require('../controllers/userController');
const { uploadAvatar } = require('../utils/multer');
const userRouter = express.Router();

// authController
userRouter.post('/register', uploadAvatar.single('avatar'), register);
userRouter.post('/login', login);
userRouter.get('/nickname/check', isNicknameExist);
userRouter.get('/email/check', isEmailExist);
userRouter.patch('/password/change', protect, changePassword);
userRouter.patch('/', protect, uploadAvatar.single('avatar'), updateUser);
userRouter.delete('/', protect, deleteUser);

userRouter.get('/:id', getSingleUser);

module.exports = userRouter;
