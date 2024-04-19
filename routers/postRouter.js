const express = require('express');
const { getAllPost } = require('../controllers/postController');

const postRouter = express.Router();

postRouter.get('/', getAllPost);

module.exports = postRouter;
