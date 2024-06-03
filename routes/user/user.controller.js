const userService = require('./user.service');
const appError = require('../../utils/appError');

exports.register = async (req, res, next) => {
    try {
        const newUser = await userService.register(req.body, req.file);
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
    userService.login(req, res, next);
};

exports.logout = (req, res, next) => {
    userService.logout(req, res, next);
};

exports.isNicknameExist = async (req, res) => {
    try {
        const isExist = await userService.isNicknameExist(req.query.nickname);
        res.status(200).json({
            message: 'success',
            isExist,
        });
    } catch (err) {
        console.log(err);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.isEmailExist = async (req, res) => {
    try {
        const isExist = await userService.isEmailExist(req.query.email);
        res.status(200).json({
            message: 'success',
            isExist,
        });
    } catch (err) {
        console.log(err);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        await userService.changePassword(userId, req.body.password);
        res.status(201).json({
            message: 'Password Changed Successfully',
            user_id: userId,
        });
    } catch (err) {
        console.log(err);
        return next(err);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateUser(req.user.user_id, req.body, req.file);
        res.status(201).json({
            message: 'User Updated Successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.log(err);
        return next(new appError('Internal Server Error', 500));
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.user.user_id);
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

exports.getSingleUser = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const user = await userService.getSingleUser(user_id);

        res.status(200).json({
            status: 'success',
            user,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
};
