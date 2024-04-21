const multer = require('multer');

const avatarStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/uploads/avatar');
    },
    filename: (req, file, callback) => {
        const currentTime = Math.floor(new Date().getTime() / 2000);
        let fileName = file.originalname.split('.');
        const changedFileName = `${fileName[0]}_${currentTime}.${fileName[1]}`;
        callback(null, changedFileName);
    },
});

const postImageStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/uploads/post');
    },
    filename: (req, file, callback) => {
        const currentTime = Math.floor(new Date().getTime() / 2000);
        let fileName = file.originalname.split('.');
        const changedFileName = `${fileName[0]}_${currentTime}.${fileName[1]}`;
        callback(null, changedFileName);
    },
});
const limits = {
    fieldNameSize: 200,
    //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정"
    fileSize: 16777216,
    //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
    files: 1,
};

exports.uploadAvatar = multer({ storage: avatarStorage, limits: limits });
exports.uploadPostImage = multer({ storage: postImageStorage, limits: limits });
