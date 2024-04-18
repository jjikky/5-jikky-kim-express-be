const express = require('express');
const fs = require('fs');
const path = require('path');

const postRouter = express.Router();

const posts = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'data', 'posts.json')));

postRouter.get('/', (_, res) => {
    res.status(200).json({ message: 'Success', data: posts });
});

module.exports = postRouter;
