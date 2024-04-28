const appError = require('../utils/appError');

exports.isLoggedIn = (req, _, next) => {
    // 로그인 된 사용자인지 판별
    if (req.isAuthenticated()) {
        next();
    } else {
        return next(new appError('You are not logged in to get access', 401));
    }
};

exports.isNotLoggedIn = (req, _, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        return next(new appError('You are already logged in', 403));
    }
};

exports.autoLogin = (req, res) => {
    if (req.isAuthenticated()) {
        return res.status(200).json({ message: 'logined' });
    }
    return res.status(200).json({ message: 'not logged in' });
};
