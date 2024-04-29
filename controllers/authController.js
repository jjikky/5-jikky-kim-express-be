const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const appError = require('../utils/appError');
const { deletePostImage, deleteAvatar } = require('../utils/multer');

const IMAGE_PATH = 'http://localhost:5000/uploads/avatar';
const usersJsonPath = path.join(__dirname, '../', 'data', 'users.json');
const postsJsonPath = path.join(__dirname, '../', 'data', 'posts.json');

exports.register = async (req, res, next) => {
    try {
        let users = JSON.parse(fs.readFileSync(usersJsonPath));
        // TODO : validate 필요
        const { nickname, email, password } = req.body;

        let image = req.file;
        let fileName = image.originalname.split('.');
        const currentTime = Math.floor(new Date().getTime() / 2000);
        const hash = await bcrypt.hash(password, 12);
        const newUser = {
            user_id: users.length + 1,
            email,
            password: hash,
            nickname,
            avatar: `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`,
        };

        users.push(newUser);
        fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2), 'utf8');

        res.status(201).json({
            message: 'user registered successfully',
            user_id: newUser.user_id,
        });
    } catch (err) {
        console.log(err);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new appError('Please provide your email and password', 401));
    passport.authenticate('local', (authError, user, info) => {
        // local strategy를 이용해 로그인
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            // 로그인 실패
            return next(new appError(info.message, 401));
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.status(200).json({
                message: 'login success',
                user_id: user.user_id,
            });
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout(req.user, (err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy(() => {
            req.session;
        });
        res.status(200).json({
            message: 'logout success',
        });
    });
};

exports.isNicknameExist = (req, res) => {
    let users = JSON.parse(fs.readFileSync(usersJsonPath));
    const nickname = req.query.nickname;
    const user = users.find((user) => user.nickname === nickname);

    // 중복 : true
    let isExist = false;
    if (user !== undefined) {
        isExist = true;
    }
    res.status(200).json({
        message: 'success',
        isExist,
    });
};
exports.isEmailExist = (req, res) => {
    let users = JSON.parse(fs.readFileSync(usersJsonPath));
    const email = req.query.email;
    const user = users.find((user) => user.email === email);

    // 중복 : true
    let isExist = false;
    if (user !== undefined) {
        isExist = true;
    }
    res.status(200).json({
        message: 'success',
        isExist,
    });
};

exports.changePassword = async (req, res, next) => {
    try {
        let users = JSON.parse(fs.readFileSync(usersJsonPath));
        const password = req.body.password;
        const user_id = req.user.user_id * 1;
        let user = users.find((user) => user.user_id === user_id);
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) return next(new appError('Same As The Original Password', 400));
        const hash = await bcrypt.hash(password, 12);
        user.password = hash;
        fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2), 'utf8');

        res.status(201).json({
            message: 'Password Changed Successfully',
            user_id,
        });
    } catch (error) {
        console.log(error);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.updateUser = (req, res, next) => {
    try {
        let users = JSON.parse(fs.readFileSync(usersJsonPath));
        const user_id = req.user.user_id;
        const { nickname, email } = req.body;
        let user = users.find((user) => user.user_id === user_id);
        user.nickname = nickname;
        user.email = email;

        if (req.file !== undefined) {
            // 기존 이미지 삭제
            deleteAvatar(user);

            // 이미지 업데이트 처리
            let image = req.file;
            let fileName = image.originalname.split('.');
            const currentTime = Math.floor(new Date().getTime() / 2000);
            user.avatar = `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`;
        }

        fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2), 'utf8');

        res.status(201).json({
            message: 'User Updated Successfully',
            user,
        });
    } catch (error) {
        console.log(error);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        let users = JSON.parse(fs.readFileSync(usersJsonPath));
        let posts = JSON.parse(fs.readFileSync(postsJsonPath));
        const user_id = req.user.user_id;
        let user = users.find((user) => user.user_id == user_id);

        if (!user) {
            return next(new appError('User not found', 404));
        }

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            if (post.creator.user_id == user_id) {
                // 유저가 남긴 게시글 이미지 삭제
                deletePostImage(post);
                // 유저가 남긴 게시글 삭제
                posts.splice(i, 1);
                // 현재 인덱스가 한 칸 뒤로 이동했으므로 다음 요소를 체크
                i--;
            }
            // 유저가 남긴 댓글 삭제
            for (let j = 0; j < post.comments.length; j++) {
                const comment = post.comments[j];
                if (comment.creator.user_id == user_id) {
                    post.comments.splice(j, 1);
                    j--;
                }
            }
        }

        deleteAvatar(user);
        users = users.filter((user) => user.user_id != user_id);
        await fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2), 'utf8');
        await fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');
        req.logout(req.user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.destroy(() => {
                req.session;
            });
            res.status(200).json({
                message: 'User Deleted Successfully',
            });
        });
    } catch (err) {
        console.log(err);
        return next(new appError('Internal Server Error', 500));
    }
};
