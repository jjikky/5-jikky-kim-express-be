const wordRepository = require('./word.repository');
const appError = require('../../utils/appError');

exports.getAllWord = async (page, limit) => {
    const pageNumber = page * 1 || 1;
    const limitNumber = limit * 1 || 10;
    const skip = limitNumber * (pageNumber - 1);

    return await wordRepository.getAllWord(limitNumber, skip);
};

exports.getSearchResult = async (keyword) => {
    return await wordRepository.getSearchResult(keyword);
};
