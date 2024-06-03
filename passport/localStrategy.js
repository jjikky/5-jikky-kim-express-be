const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db'); // 데이터베이스 연결 설정

module.exports = () => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                session: true,
            },
            async (email, password, done) => {
                try {
                    const sql = 'SELECT * FROM USERS WHERE email = ? AND deleted_at IS NULL';
                    const [rows] = await db.execute(sql, [email]);

                    if (rows.length > 0) {
                        const exUser = rows[0];
                        const result = await bcrypt.compare(password, exUser.password);
                        if (result) {
                            done(null, exUser);
                        } else {
                            done(null, false, { message: 'Incorrect email and password.' });
                        }
                    } else {
                        done(null, false, { message: '가입되지 않은 회원입니다.' });
                    }
                } catch (error) {
                    console.error(error);
                    done(error);
                }
            }
        )
    );
};
