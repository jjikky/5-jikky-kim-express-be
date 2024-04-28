const fs = require('fs');
const path = require('path');
const moment = require('moment');
const appError = require('../utils/appError');

const postsJsonPath = path.join(__dirname, '../', 'data', 'posts.json');
const usersJsonPath = path.join(__dirname, '../', 'data', 'users.json');
const IMAGE_PATH = 'http://localhost:5000/uploads/post';

exports.getAllPost = (req, res) => {
    try {
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));
        let users = JSON.parse(fs.readFileSync(usersJsonPath));
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        //  page=5 & limit = 10  >>  40 data skip
        const skip = limit * (page - 1);

        let allPost = posts.slice(skip, limit * page);
        allPost.forEach((post) => {
            const user = users.find((user) => user.user_id == post.creator.user_id);
            post.creator.avatar = user.avatar;
            post.creator.nickname = user.nickname;
        });

        res.status(200).json({
            message: 'success',
            posts: allPost,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.getSinglePost = (req, res, next) => {
    try {
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));
        let users = JSON.parse(fs.readFileSync(usersJsonPath));
        const post_id = req.params.id * 1;

        let post = posts.find((post) => post.post_id === post_id);
        const creator = users.find((user) => user.user_id == post.creator.user_id);
        if (!post) {
            return next(new appError('page not found', 404));
        }

        // 조회수 증가
        // TODO : user ip 기반 제한 ?
        post.count.view++;
        fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');

        post.creator.avatar = creator.avatar;
        post.creator.nickname = creator.nickname;
        post.comments.forEach((comment) => {
            let comment_creator = users.find((user) => user.user_id == comment.creator.user_id);
            comment.creator.avatar = comment_creator.avatar;
            comment.creator.nickname = comment_creator.nickname;
        });

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
            post_id: maxPostId,
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

function deletePostImage(post) {
    const filename = post.post_image.substring(post.post_image.lastIndexOf('/') + 1);
    const filePath = path.join(__dirname, '../', 'public', 'uploads', 'post', `${filename}`);
    fs.unlinkSync(filePath, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

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
