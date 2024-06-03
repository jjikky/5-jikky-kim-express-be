const bcrypt = require('bcrypt');
const passport = require('passport');
const appError = require('../utils/appError');

const IMAGE_PATH = '/uploads/avatar';
const db = require('../db');

exports.register = async (req, res, next) => {
    try {
        const { nickname, email, password } = req.body;

        let image = req.file;
        let fileName = image.originalname.split('.');
        const currentTime = Math.floor(new Date().getTime() / 2000);
        const hash = await bcrypt.hash(password, 12);
        const newUser = {
            email,
            password: hash,
            nickname,
            avatar: `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`,
        };

        const sql = 'INSERT INTO USERS (email, password, nickname, avatar) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [newUser.email, newUser.password, newUser.nickname, newUser.avatar]);

        res.status(201).json({
            message: 'user registered successfully',
            user_id: result.insertId,
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

exports.isNicknameExist = async (req, res) => {
    const nickname = req.query.nickname;
    const sql = 'SELECT * FROM USERS WHERE nickname = ? AND deleted_at IS NULL';
    const [rows] = await db.execute(sql, [nickname]);

    let isExist = false;
    if (rows.length > 0) {
        isExist = true;
    }
    res.status(200).json({
        message: 'success',
        isExist,
    });
};
exports.isEmailExist = async (req, res) => {
    const email = req.query.email;
    const sql = 'SELECT * FROM USERS WHERE email = ? AND deleted_at IS NULL';
    const [rows] = await db.execute(sql, [email]);

    let isExist = false;
    if (rows.length > 0) {
        isExist = true;
    }
    res.status(200).json({
        message: 'success',
        isExist,
    });
};

exports.changePassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const user_id = req.user.user_id;

        const sql = 'SELECT password FROM USERS WHERE user_id = ? AND deleted_at IS NULL';
        const [rows] = await db.execute(sql, [user_id]);
        if (rows.length === 0) {
            return next(new appError('User not found', 404));
        }

        const user = rows[0];
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) return next(new appError('Same As The Original Password', 400));

        const hash = await bcrypt.hash(password, 12);
        const updateSql = 'UPDATE USERS SET password = ? WHERE user_id = ?';
        await db.execute(updateSql, [hash, user_id]);

        res.status(201).json({
            message: 'Password Changed Successfully',
            user_id,
        });
    } catch (error) {
        console.log(error);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const { nickname, email } = req.body;
        let avatar = null;

        if (req.file) {
            // 기존 이미지 삭제 -> ver 2.2에선 삭제 안하고 다 보존
            // const sql = 'SELECT avatar FROM USERS WHERE user_id = ? AND deleted_at IS NULL';
            // const [rows] = await db.execute(sql, [user_id]);
            // if (rows.length > 0) {
            //     deleteAvatar(rows[0]);
            // }

            // 이미지 업데이트 처리
            let image = req.file;
            let fileName = image.originalname.split('.');
            const currentTime = Math.floor(new Date().getTime() / 2000);
            avatar = `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`;
        }
        const updateSql = avatar
            ? 'UPDATE USERS SET nickname = ?, email = ?, avatar = ? WHERE user_id = ?'
            : 'UPDATE USERS SET nickname = ?, email = ? WHERE user_id = ?';
        const params = avatar ? [nickname, email, avatar, user_id] : [nickname, email, user_id];

        await db.execute(updateSql, params);

        const sql = 'SELECT * FROM USERS WHERE user_id = ? AND deleted_at IS NULL';
        const [updatedUserRows] = await db.execute(sql, [user_id]);
        const updatedUser = updatedUserRows[0];

        res.status(201).json({
            message: 'User Updated Successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.log(error);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.deleteUser = async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const user_id = req.user.user_id;

        // 사용자 논리적 삭제
        const deleteUserSql =
            'UPDATE USERS SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL';
        const [result] = await connection.execute(deleteUserSql, [user_id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return next(new appError('User not found', 404));
        }

        // 사용자가 작성한 게시글 논리적 삭제
        const postImageSql = 'SELECT post_image FROM POSTS WHERE user_id = ? AND deleted_at IS NULL';
        const [posts] = await connection.execute(postImageSql, [user_id]);
        for (const post of posts) {
            const deletePostSql = 'UPDATE POSTS SET deleted_at = CURRENT_TIMESTAMP WHERE post_id = ?';
            await connection.execute(deletePostSql, [post.post_id]);
        }

        await connection.commit();

        req.logout(req.user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.destroy(() => {
                res.status(200).json({
                    message: 'User Deleted Successfully',
                });
            });
        });
    } catch (err) {
        console.log(err);
        return next(new appError('Internal Server Error', 500));
    }
};
