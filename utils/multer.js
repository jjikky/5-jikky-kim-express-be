const multer = require('multer');
const fs = require('fs');
const path = require('path');

const avatarStorage = multer.diskStorage({
    destination: (_, _, callback) => {
        callback(null, 'public/uploads/avatar');
    },
    filename: (_, file, callback) => {
        const currentTime = Math.floor(new Date().getTime() / 2000);
        let fileName = file.originalname.split('.');
        const changedFileName = `${fileName[0]}_${currentTime}.${fileName[1]}`;
        callback(null, changedFileName);
    },
});

const postImageStorage = multer.diskStorage({
    destination: (_, _, callback) => {
        callback(null, 'public/uploads/post');
    },
    filename: (_, file, callback) => {
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

exports.deletePostImage = (post) => {
    const filename = post.post_image.substring(post.post_image.lastIndexOf('/') + 1);
    const filePath = path.join(__dirname, '../', 'public', 'uploads', 'post', `${filename}`);
    fs.unlinkSync(filePath, (err) => {
        if (err) {
            console.log(err);
        }
    });
};

exports.deleteAvatar = (user) => {
    const filename = user.avatar.substring(user.avatar.lastIndexOf('/') + 1);
    const filePath = path.join(__dirname, '../', 'public', 'uploads', 'avatar', `${filename}`);
    fs.unlinkSync(filePath, (err) => {
        if (err) {
            console.log(err);
        }
    });
};
