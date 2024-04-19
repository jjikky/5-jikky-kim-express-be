const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const IMAGE_PATH = 'http://localhost:5000/uploads';

const appError = require('../utils/appError');

const usersJsonPath = path.join(__dirname, '../', 'data', 'users.json');
let users = JSON.parse(fs.readFileSync(usersJsonPath));

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '5d',
    });
};

exports.register = (req, res, next) => {
    const { nickname, email, password } = req.body;

    let image = req.file;
    let fileName = image.originalname.split('.');
    // NOTE : 파일명 중복 안되게 파일명에 현재시각 삽입
    const currentTime = Math.floor(new Date().getTime() / 2000);

    const newUser = {
        user_id: users.length + 1,
        email,
        password,
        nickname,
        avatar: `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`,
    };

    const token = signToken(newUser.user_id);
    try {
        users.push(newUser);
        fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2), 'utf8');

        res.status(201).json({
            message: 'user registered successfully',
            token,
            // TODO : user 데이터 중 어떤 데이터 응답할지 생각해보기, 뭐가 필요한지
            newUser,
        });
    } catch (err) {
        console.log(err);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new appError('Please provide your email and password', 401));

    const user = users.find((user) => user.email === email && user.password === password);

    if (!user) {
        return next(new appError('Incorrect email and password', 401));
    }
    const token = signToken(user.user_id);
    res.status(200).json({
        message: 'login success',
        token,
        // TODO : user 데이터 중 어떤 데이터 응답할지 생각해보기, 뭐가 필요한지
        user,
    });
};

exports.isNicknameExist = (req, res, next) => {
    // 중복 : true
    const nickname = req.query.nickname;
    const user = users.find((user) => user.nickname === nickname);

    let isExist = false;
    if (user !== undefined) {
        isExist = true;
    }
    res.status(200).json({
        message: 'success',
        isExist,
    });
};
exports.isEmailExist = (req, res, next) => {
    // 중복 : true
    const email = req.query.email;
    const user = users.find((user) => user.email === email);

    let isExist = false;
    if (user !== undefined) {
        isExist = true;
    }
    res.status(200).json({
        message: 'success',
        isExist,
    });
};
