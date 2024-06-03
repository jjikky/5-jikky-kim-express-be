const bcrypt = require('bcrypt');
const passport = require('passport');
const userRepository = require('./user.repository');
const appError = require('../../utils/appError');
const IMAGE_PATH = '/uploads/avatar';

exports.register = async (userData, file) => {
    let fileName = file.originalname.split('.');
    const currentTime = Math.floor(new Date().getTime() / 2000);
    const hash = await bcrypt.hash(userData.password, 12);
    const newUser = {
        email: userData.email,
        password: hash,
        nickname: userData.nickname,
        avatar: `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`,
    };
    return await userRepository.createUser(newUser);
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
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

exports.isNicknameExist = async (nickname) => {
    const user = await userRepository.findUserByNickname(nickname);
    return user.length > 0;
};

exports.isEmailExist = async (email) => {
    const user = await userRepository.findUserByEmail(email);
    return user.length > 0;
};

exports.changePassword = async (userId, password) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new appError('User not found', 404);
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
        throw new appError('Same As The Original Password', 400);
    }

    const hash = await bcrypt.hash(password, 12);
    await userRepository.updatePassword(userId, hash);
};

exports.updateUser = async (userId, userData, file) => {
    let avatar = null;
    if (file) {
        let fileName = file.originalname.split('.');
        const currentTime = Math.floor(new Date().getTime() / 2000);
        avatar = `${IMAGE_PATH}/${fileName[0]}_${currentTime}.${fileName[1]}`;
    }
    return await userRepository.updateUser(userId, userData, avatar);
};

exports.deleteUser = async (userId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await userRepository.deleteUser(connection, userId);
        const posts = await userRepository.findPostsByUserId(connection, userId);

        for (const post of posts) {
            await userRepository.deletePost(connection, post.post_id);
        }

        await userRepository.deleteComments(connection, userId);

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

exports.getSingleUser = async (user_id) => {
    const user = await userRepository.findUserById(user_id);

    if (!user) {
        throw new appError('User not found', 404);
    }

    return user;
};
