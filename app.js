const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const userRouter = require('./routers/userRouter');
const postRouter = require('./routers/postRouter');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Success' });
});
app.use('/users', userRouter);
app.use('/posts', postRouter);

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`,
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`app listening on http://localhost:${PORT}`);
});
