const express = require('express');
const {
    getAllPost,
    getSinglePost,
    createPost,
    updatePost,
    deletePost,
    createComment,
    updateComment,
    deleteComment,
} = require('../controllers/postController');
const { protect } = require('../controllers/authController');
const { uploadPostImage } = require('../utils/multer');

const postRouter = express.Router();

postRouter.get('/', protect, getAllPost);
postRouter.get('/:id', getSinglePost);

postRouter.post('/:post_id/comment', protect, createComment);
postRouter.patch('/:post_id/comment/:comment_id', protect, updateComment);
postRouter.delete('/:post_id/comment/:comment_id', protect, deleteComment);

postRouter.post('/', protect, uploadPostImage.single('post_image'), createPost);
postRouter.patch('/:id', protect, uploadPostImage.single('post_image'), updatePost);
postRouter.delete('/:id', protect, deletePost);

module.exports = postRouter;
