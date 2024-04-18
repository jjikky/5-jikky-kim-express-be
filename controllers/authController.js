const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const usersJsonPath = path.join(__dirname, '../', 'data', 'users.json');
let users = JSON.parse(fs.readFileSync(usersJsonPath));

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '5d',
    });
};
exports.register = (req, res, next) => {
    const { nickname, email, password } = req.body;
    const newUser = {
        user_id: users.length + 1,
        email,
        password,
        nickname,
        // TODO : 파일 업로드 구현 하면서 변경
        avatar: 'http://localhost:3000/img/avatar.jpg',
    };
    const token = signToken(newUser.user_id);
    try {
        users.push(newUser);
        fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2), 'utf8');

        res.status(201).json({
            message: 'user registered successfully',
            token,
            data: {
                user: newUser,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.login = (req, res, next) => {};
