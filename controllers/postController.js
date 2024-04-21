const fs = require('fs');
const path = require('path');
const moment = require('moment');
const appError = require('../utils/appError');

const postsJsonPath = path.join(__dirname, '../', 'data', 'posts.json');
const usersJsonPath = path.join(__dirname, '../', 'data', 'users.json');
const IMAGE_PATH = 'http://localhost:5000/uploads/post';

let posts = JSON.parse(fs.readFileSync(postsJsonPath));
let users = JSON.parse(fs.readFileSync(usersJsonPath));

exports.getAllPost = (req, res) => {
    try {
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        //  page=5 & limit = 10  >>  40 data skip
        const skip = limit * (page - 1);

        let allPost = posts.slice(skip, limit * page);

        res.status(200).json({
            message: 'success',
            posts: allPost,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.getSinglePost = (req, res) => {
    try {
        const post_id = req.params.id * 1;
        let post = posts.find((post) => post.post_id === post_id);

        // 조회수 증가
        // TODO : user ip 기반 제한 ?
        post.count.view++;
        fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');

        res.status(200).json({
            message: 'success',
            post,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createPost = (req, res, next) => {
    try {
        const { title, content } = req.body;
        const { user_id, nickname, avatar } = req.user;
        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        let image = req.file;
        let fileName = image.originalname.split('.');
        // NOTE : 파일명 중복 안되게 파일명에 현재시각 삽입
        const currentTime = Math.floor(new Date().getTime() / 2000);

        const newPost = {
            post_id: posts.length + 1,
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
                nickname,
                avatar,
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
        const post_id = req.params.post_id * 1;
        const content = req.body.comment;
        const user_id = req.user.user_id * 1;

        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');

        let post = posts.find((post) => post.post_id === post_id);
        let user = users.find((user) => user.user_id === user_id);

        const nickname = user.nickname;
        const avatar = user.avatar;
        // comment_id 구현

        const comment_id = post.comments.length + 1;
        const comment = {
            comment_id,
            creator: {
                user_id,
                nickname,
                avatar,
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
    const { post_id, comment_id } = req.params;
};

exports.deleteComment = (req, res, next) => {
    const { post_id, comment_id } = req.params;
};
