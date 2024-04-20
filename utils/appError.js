class appError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.message = message;
        // TODO : 필요한 것 넣기
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = appError;
