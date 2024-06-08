const postRepository = require('./post.repository');
const appError = require('../../utils/appError');

const IMAGE_PATH = '/uploads/post';

exports.getAllPost = async (page, limit) => {
    const pageNumber = page * 1 || 1;
    const limitNumber = limit * 1 || 10;
    const skip = limitNumber * (pageNumber - 1);

    return await postRepository.getAllPost(limitNumber, skip);
};

exports.getSinglePost = async (post_id) => {
    const post = await postRepository.getSinglePost(post_id);
    if (!post) {
        throw new appError('Post not found', 404);
    }

    // 조회수 증가
    await postRepository.incrementViewCount(post_id);

    return post;
};

exports.createPost = async (postData, file, user_id) => {
    let fileName = file.originalname.split('.');
    const currentTime = Math.floor(new Date().getTime() / 2000);

    const newPost = {
        title: postData.title,
        content: postData.content,
        post_image: `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`,
        user_id,
    };

    return await postRepository.createPost(newPost);
};

exports.updatePost = async (post_id, postData, file) => {
    let updateData = { title: postData.title, content: postData.content };

    if (file) {
        let fileName = file.originalname.split('.');
        const currentTime = Math.floor(new Date().getTime() / 2000);
        updateData.post_image = `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`;
    }

    await postRepository.updatePost(post_id, updateData);
};

exports.deletePost = async (post_id) => {
    await postRepository.deletePost(post_id);
};

exports.getComments = async (post_id) => {
    return await postRepository.getCommentsByPostId(post_id);
};

exports.createComment = async (post_id, comment, user_id) => {
    const newComment = {
        post_id,
        user_id,
        comment,
    };

    await postRepository.createComment(newComment);

    // 댓글 수 증가
    await postRepository.incrementCommentCount(post_id);
};

exports.updateComment = async (post_id, comment_id, comment) => {
    await postRepository.updateComment(post_id, comment_id, comment);
};

exports.deleteComment = async (post_id, comment_id) => {
    const connection = await postRepository.getConnection();
    try {
        await connection.beginTransaction();

        await postRepository.deleteComment(connection, post_id, comment_id);

        // 댓글 수 감소
        await postRepository.decrementCommentCount(connection, post_id);

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw new appError('Internal Server Error', 500);
    } finally {
        connection.release();
    }
};
