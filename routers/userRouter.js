const express = require('express');
const multer = require('multer');
const { register, login, isNicknameExist, isEmailExist } = require('../controllers/authController');
const { getSingleUser } = require('../controllers/userController');

const userRouter = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/uploads/avatar');
    },
    filename: (req, file, callback) => {
        const currentTime = Math.floor(new Date().getTime() / 2000);
        let fileName = file.originalname.split('.');
        const changedFileName = `${fileName[0]}_${currentTime}.${fileName[1]}`;
        callback(null, changedFileName);
    },
});
const limits = {
    fieldNameSize: 200,
    //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정"
    fileSize: 16777216,
    //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
    files: 1,
};
const upload = multer({ storage: storage, limits: limits });

// authController
userRouter.post('/register', upload.single('avatar'), register);
userRouter.post('/login', login);
userRouter.get('/nickname/check', isNicknameExist);
userRouter.get('/email/check', isEmailExist);

userRouter.get('/:id', getSingleUser);

module.exports = userRouter;
