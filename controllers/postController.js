const db = require('../db');
const moment = require('moment');
const appError = require('../utils/appError');
const { deletePostImage } = require('../utils/multer');

const IMAGE_PATH = 'http://localhost:5000/uploads/post';

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
        JOIN USERS as u ON p.creator = u.user_id 
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
      JOIN USERS ON POSTS.creator = USERS.user_id 
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

exports.createPost = (req, res, next) => {
    try {
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));
        const { title, content } = req.body;
        const { user_id } = req.user;
        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        let image = req.file;
        let fileName = image.originalname.split('.');
        // NOTE : 파일명 중복 안되게 파일명에 현재시각 삽입
        const currentTime = Math.floor(new Date().getTime() / 2000);
        const maxPostId = posts[posts.length - 1]?.post_id || 0;

        const newPost = {
            post_id: maxPostId + 1,
            title,
            content,
            created_at: created_at,
            post_image: `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`,
            count: {
                like: 0,
                comment: 0,
                view: 0,
            },
            creator: {
                user_id,
            },
            comments: [],
        };
        posts.push(newPost);
        fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');
        res.status(201).json({
            message: 'post created successfully',
            newPost,
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};
exports.updatePost = (req, res, next) => {
    try {
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));
        const post_id = req.params.id * 1;
        let post = posts.find((post) => post.post_id === post_id);
        const { title, content } = req.body;
        post.title = title;
        post.content = content;

        if (req.file !== undefined) {
            // 기존 이미지 삭제
            deletePostImage(post);

            // 이미지 업데이트 처리
            let image = req.file;
            let fileName = image.originalname.split('.');
            const currentTime = Math.floor(new Date().getTime() / 2000);
            post.post_image = `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`;
        }

        fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');

        res.status(200).json({
            message: 'post updated successfully',
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.deletePost = (req, res, next) => {
    try {
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));
        const post_id = req.params.id;
        let post = posts.find((post) => post.post_id == post_id);
        // 파일 삭제
        deletePostImage(post);

        // 더미데이터에서 해당 객체 삭제
        let index = posts.indexOf(post);
        posts.splice(index, 1);
        fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');
        res.status(200).json({
            message: 'post deleted successfully',
        });
    } catch (err) {
        console.log(err);
        next(new appError('Internal Server Error', 500));
    }
};

exports.createComment = (req, res, next) => {
    try {
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));

        const post_id = req.params.post_id * 1;
        const content = req.body.comment;
        const user_id = req.user.user_id * 1;

        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');

        let post = posts.find((post) => post.post_id === post_id);
        const maxCommentId = post.comments[post.comments.length - 1]?.comment_id || 0;
        const comment_id = maxCommentId + 1;

        const comment = {
            comment_id,
            creator: {
                user_id,
            },
            content,
            created_at,
        };
        post.comments.push(comment);

        fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');
        res.status(201).json({
            message: 'comment created successfully',
            post,
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
