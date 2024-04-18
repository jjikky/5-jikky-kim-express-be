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
exports.register = (req, res) => {
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
            // TODO : user 데이터 중 어떤 데이터 응답할지 생각해보기, 뭐가 필요한지
            user,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(401).json({ message: 'Please provide your email and password' });

    const user = users.find((user) => user.email === email && user.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Incorrect email and password' });
    }
    const token = signToken(user.user_id);
    res.status(200).json({
        status: 'login success',
        token,
        // TODO : user 데이터 중 어떤 데이터 응답할지 생각해보기, 뭐가 필요한지
        user,
    });
};
