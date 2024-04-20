const express = require('express');
const { getAllPost, getSinglePost, createPost, updatePost, deletePost } = require('../controllers/postController');
const { protect } = require('../controllers/authController');
const { uploadPostImage } = require('../utils/multer');

const postRouter = express.Router();

postRouter.get('/', protect, getAllPost);
postRouter.get('/:id', getSinglePost);

postRouter.post('/', protect, uploadPostImage.single('post_image'), createPost);
postRouter.patch('/:id', protect, uploadPostImage.single('post_image'), updatePost);
postRouter.delete('/:id', protect, deletePost);

module.exports = postRouter;
