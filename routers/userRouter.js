const express = require('express');
const fs = require('fs');
const path = require('path');

const userRouter = express.Router();

const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'data', 'users.json')));
userRouter.get('/', (_, res) => {
    res.status(200).json({ message: 'Success', data: users });
});

module.exports = userRouter;
