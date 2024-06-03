const postService = require('./post.service');
const appError = require('../../utils/appError');

exports.getAllPost = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const posts = await postService.getAllPost(page, limit);
        res.status(200).json({
            message: 'success',
            posts,
        });
    } catch (error) {
        console.error(error);
        next(new appError('Internal Server Error', 500));
    }
};

exports.getSinglePost = async (req, res, next) => {
    try {
        const post_id = req.params.id * 1;
        const post = await postService.getSinglePost(post_id, req.user.user_id);
        res.status(200).json({
            message: 'success',
            post,
            user_id: req.user.user_id,
        });
    } catch (error) {
        console.error(error);
        next(new appError('Internal Server Error', 500));
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const newPost = await postService.createPost(req.body, req.file, req.user.user_id);
        res.status(201).json({
            message: 'post created successfully',
            newPost,
        });
    } catch (err) {
        console.error(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.updatePost = async (req, res, next) => {
    try {
        await postService.updatePost(req.params.id, req.body, req.file);
        res.status(200).json({
            message: 'post updated successfully',
        });
    } catch (err) {
        console.error(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        await postService.deletePost(req.params.id);
        res.status(200).json({
            message: 'post deleted successfully',
        });
    } catch (err) {
        console.error(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.createComment = async (req, res, next) => {
    try {
        await postService.createComment(req.params.post_id, req.body.comment, req.user.user_id);
        res.status(201).json({
            message: 'comment created successfully',
        });
    } catch (err) {
        console.error(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.updateComment = async (req, res, next) => {
    try {
        await postService.updateComment(req.params.post_id, req.params.comment_id, req.body.comment);
        res.status(200).json({
            message: 'comment updated successfully',
        });
    } catch (err) {
        console.error(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        await postService.deleteComment(req.params.post_id, req.params.comment_id);
        res.status(200).json({
            message: 'comment deleted successfully',
        });
    } catch (err) {
        console.error(err);
        next(new appError('Internal Server Error', 500));
    }
};
