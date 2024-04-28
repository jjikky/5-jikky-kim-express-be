const passport = require('passport');
const path = require('path');
const fs = require('fs');
const local = require('./localStrategy');

const usersJsonPath = path.join(__dirname, '../', 'data', 'users.json');
let users = JSON.parse(fs.readFileSync(usersJsonPath));

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    });

    passport.deserializeUser((id, done) => {
        let user = users.find((user) => user.user_id == id);
        if (user) {
            done(null, user);
        } else {
            done(err);
        }
    });

    local();
};
