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
        const post_id = req.params.post_id;
        let post = posts.find((post) => post.id === post_id);

        // TODO : 조회수 +1

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
exports.updatePost = (req, res, next) => {};
exports.deletePost = (req, res, next) => {};
