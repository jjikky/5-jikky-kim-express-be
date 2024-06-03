const db = require('../db');
const fs = require('fs');
const appError = require('../utils/appError');

const IMAGE_PATH = '/uploads/post';

exports.getAllPost = async (req, res) => {
    try {
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        //  page=5 & limit = 10  >>  40 data skip
        const skip = limit * (page - 1);

        const postsSql = `
        SELECT 
          p.*, 
          u.avatar AS creator_avatar, 
          u.nickname AS creator_nickname
        FROM posts as p
        JOIN USERS as u ON p.user_id = u.user_id 
        WHERE p.deleted_at IS NULL 
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`;

        const [posts] = await db.execute(postsSql, [limit + '', skip + '']);

        res.status(200).json({
            message: 'success',
            posts,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.getSinglePost = async (req, res, next) => {
    try {
        const post_id = req.params.id * 1;

        const postSql = `
      SELECT 
        POSTS.*, 
        USERS.avatar AS creator_avatar, 
        USERS.nickname AS creator_nickname
      FROM POSTS 
      JOIN USERS ON POSTS.user_id = USERS.user_id 
      WHERE POSTS.post_id = ? AND POSTS.deleted_at IS NULL`;

        const [posts] = await db.execute(postSql, [post_id]);
        if (posts.length === 0) {
            return next(new appError('Post not found', 404));
        }

        const post = posts[0];

        // 댓글 가져오기
        const commentsSql = `
      SELECT 
        COMMENTS.*, 
        USERS.avatar AS creator_avatar, 
        USERS.nickname AS creator_nickname
      FROM COMMENTS 
      JOIN USERS ON COMMENTS.user_id = USERS.user_id 
      WHERE COMMENTS.post_id = ? AND COMMENTS.deleted_at IS NULL`;

        const [comments] = await db.execute(commentsSql, [post_id]);
        post.comments = comments;

        // 조회수 증가
        const updateViewCountSql = 'UPDATE POSTS SET count_view = count_view + 1 WHERE post_id = ?';
        await db.execute(updateViewCountSql, [post_id]);

        res.status(200).json({
            message: 'success',
            post,
            user_id: req.user.user_id,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const { user_id } = req.user;
        let image = req.file;
        let fileName = image.originalname.split('.');
        const currentTime = Math.floor(new Date().getTime() / 2000);

        const newPost = {
            title,
            content,
            post_image: `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`,
            user_id,
        };

        const createPostSql = `
      INSERT INTO POSTS (title, content,post_image, user_id)
      VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(createPostSql, Object.values(newPost));

        newPost.post_id = result.insertId;

        res.status(201).json({
            message: 'post created successfully',
            newPost,
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};
exports.updatePost = async (req, res, next) => {
    try {
        const post_id = req.params.id * 1;
        const { title, content } = req.body;

        let updateSql = 'UPDATE POSTS SET title = ?, content = ?';
        const params = [title, content];

        if (req.file) {
            // 이미지 업데이트 처리
            let image = req.file;
            let fileName = image.originalname.split('.');
            const currentTime = Math.floor(new Date().getTime() / 2000);
            const post_image = `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`;

            updateSql += ', post_image = ?';
            params.push(post_image);
        }

        updateSql += ' WHERE post_id = ?';
        params.push(post_id);

        await db.execute(updateSql, params);

        res.status(200).json({
            message: 'post updated successfully',
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const post_id = req.params.id * 1;

        // 게시글 논리적 삭제
        const deletePostSql = 'UPDATE POSTS SET deleted_at = CURRENT_TIMESTAMP WHERE post_id = ?';
        await db.execute(deletePostSql, [post_id]);

        res.status(200).json({
            message: 'post deleted successfully',
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.createComment = async (req, res, next) => {
    try {
        const post_id = req.params.post_id * 1;
        const { comment } = req.body;
        const { user_id } = req.user;

        const newComment = {
            post_id,
            user_id,
            comment,
        };

        const createCommentSql = `
      INSERT INTO COMMENTS (post_id, user_id, content)
      VALUES (?, ?, ?)`;
        await db.execute(createCommentSql, Object.values(newComment));

        // 댓글 수 증가
        const updateCommentCountSql = 'UPDATE POSTS SET count_comment = count_comment + 1 WHERE post_id = ?';
        await db.execute(updateCommentCountSql, [post_id]);

        res.status(201).json({
            message: 'comment created successfully',
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.updateComment = (req, res, next) => {
    try {
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));
        const content = req.body.comment;
        const { post_id, comment_id } = req.params;
        let post = posts.find((post) => post.post_id === post_id * 1);
        let comment = post.comments.find((comment) => comment.comment_id === comment_id * 1);
        comment.content = content;
        fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');
        res.status(200).json({
            message: 'comment updated successfully',
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.deleteComment = (req, res, next) => {
    try {
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));
        const { post_id, comment_id } = req.params;
        let post = posts.find((post) => post.post_id === post_id * 1);

        let index = post.comments.findIndex((comment) => comment.comment_id == comment_id);

        post.comments.splice(index, 1);
        fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');
        res.status(200).json({
            message: 'comment deleted successfully',
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};
