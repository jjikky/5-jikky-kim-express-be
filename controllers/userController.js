const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');

const usersJsonPath = path.join(__dirname, '../', 'data', 'users.json');
let users = JSON.parse(fs.readFileSync(usersJsonPath));

exports.getSingleUser = (req, res, next) => {
    const user_id = req.params.id;
    const user = users.find((user) => user.user_id == user_id);
    if (!user) {
        return next(new appError('User not found', 404));
    }
    res.status(200).json({
        status: 'success',
        user,
    });
};
