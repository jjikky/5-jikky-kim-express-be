const express = require('express');
const { getAllPost, getSinglePost } = require('../controllers/postController');
const { protect } = require('../controllers/authController');

const postRouter = express.Router();

postRouter.get('/', protect, getAllPost);
postRouter.get('/:id', getSinglePost);

module.exports = postRouter;
