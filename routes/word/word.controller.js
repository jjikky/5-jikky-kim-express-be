const wordService = require('./word.service');
const appError = require('../../utils/appError');

exports.getAllWord = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const words = await wordService.getAllWord(page, limit);
        res.status(200).json({
            message: 'success',
            words,
        });
    } catch (error) {
        console.error(error);
        next(new appError('Internal Server Error', 500));
    }
};

exports.getSearchResult = async (req, res, next) => {
    try {
        const { keyword } = req.query;

        const words = await wordService.getSearchResult(keyword);
        console.log();
        res.status(200).json({
            message: 'success',
            words,
        });
    } catch (error) {
        console.error(error);
        next(new appError('Internal Server Error', 500));
    }
};
