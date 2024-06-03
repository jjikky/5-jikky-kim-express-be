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
} = require('../routes/post/post.controller');
const { uploadPostImage } = require('../utils/multer');
const { isLoggedIn } = require('../utils/middlewares');

const postRouter = express.Router();

postRouter.get('/', isLoggedIn, getAllPost);
postRouter.get('/:id', isLoggedIn, getSinglePost);

postRouter.post('/:post_id/comment', isLoggedIn, createComment);
postRouter.patch('/:post_id/comment/:comment_id', isLoggedIn, updateComment);
postRouter.delete('/:post_id/comment/:comment_id', isLoggedIn, deleteComment);

postRouter.post('/', isLoggedIn, uploadPostImage.single('post_image'), createPost);
postRouter.patch('/:id', isLoggedIn, uploadPostImage.single('post_image'), updatePost);
postRouter.delete('/:id', deletePost);

module.exports = postRouter;
