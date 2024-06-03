const db = require('../db'); // 데이터베이스 연결 설정
const appError = require('../utils/appError');

exports.getSingleUser = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const sql = 'SELECT * FROM USERS WHERE user_id = ? AND deleted_at IS NULL';
        const [rows] = await db.execute(sql, [user_id]);

        if (rows.length === 0) {
            return next(new appError('User not found', 404));
        }

        const user = rows[0];
        res.status(200).json({
            status: 'success',
            user,
        });
    } catch (error) {
        console.error(error);
        return next(new appError('Internal Server Error', 500));
    }
};
