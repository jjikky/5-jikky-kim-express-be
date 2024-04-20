const express = require('express');
const { getAllPost } = require('../controllers/postController');
const { protect } = require('../controllers/authController');

const postRouter = express.Router();

postRouter.get('/', protect, getAllPost);

module.exports = postRouter;
