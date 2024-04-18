const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

app.use(morgan('dev'));
app.use(helmet());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('hello');
});

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`,
    });
});

const port = 5000;
app.listen(port, () => {
    console.log(`app listening on http://localhost:${port}`);
});
