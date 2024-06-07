const express = require('express');
const { getAllWord, getSearchResult } = require('./word.controller');
const { isLoggedIn } = require('../../utils/middlewares');

const postRouter = express.Router();

postRouter.get('/', isLoggedIn, getAllWord);
postRouter.get('/search', isLoggedIn, getSearchResult);

module.exports = postRouter;
