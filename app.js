const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const appError = require('./utils/appError');
const userRouter = require('./routes/user/user.route');
const postRouter = require('./routes/post/post.route');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./passport');
const dotenv = require('dotenv');

dotenv.config();
passportConfig();

const app = express();

app.use(morgan('dev'));
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
            },
        },
        crossOriginResourcePolicy: false,
    })
);
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        name: 'user',
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            // cleint 쿠키 접근 불가
            httpOnly: true,
            secure: false,
            // 10h
            maxAge: 36000000,
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Success' });
});
app.use('/users', userRouter);
app.use('/posts', postRouter);

app.all('*', (req, _, next) => {
    next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(function (err, _, res, next) {
    console.log(err);
    res.status(err.statusCode).json({ status: err.status, message: err.message });
    next();
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`app listening on http://localhost:${PORT}`);
});
