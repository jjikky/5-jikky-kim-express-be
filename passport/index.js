const passport = require('passport');
const db = require('../db'); // 데이터베이스 연결 설정
const local = require('./localStrategy');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const sql = 'SELECT * FROM USERS WHERE user_id = ?';
            const [rows] = await db.execute(sql, [id]);

            if (rows.length > 0) {
                const user = rows[0];
                done(null, user);
            } else {
                done(new Error('User not found'), null);
            }
        } catch (err) {
            done(err, null);
        }
    });

    local();
};
