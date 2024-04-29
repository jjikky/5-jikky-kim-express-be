const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const usersJsonPath = path.join(__dirname, '../', 'data', 'users.json');

module.exports = () => {
    let users = JSON.parse(fs.readFileSync(usersJsonPath));
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                session: true,
            },
            async (email, password, done) => {
                try {
                    const exUser = users.find((user) => user.email == email);
                    if (exUser) {
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
