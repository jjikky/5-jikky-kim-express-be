const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const appError = require('./utils/appError');
const userRouter = require('./routers/userRouter');
const postRouter = require('./routers/postRouter');
const dotenv = require('dotenv');

dotenv.config();

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
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Success' });
});
app.use('/users', userRouter);
app.use('/posts', postRouter);

app.all('*', (req, _, next) => {
    next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(function (err, _, res, next) {
    res.send(err);
    next();
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`app listening on http://localhost:${PORT}`);
});
