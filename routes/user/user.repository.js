const db = require('../../db');

exports.createUser = async (user) => {
    const sql = 'INSERT INTO USERS (email, password, nickname, avatar) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [user.email, user.password, user.nickname, user.avatar]);
    return { user_id: result.insertId, ...user };
};

exports.findUserByNickname = async (nickname) => {
    const sql = 'SELECT * FROM USERS WHERE nickname = ? AND deleted_at IS NULL';
    const [rows] = await db.execute(sql, [nickname]);
    return rows;
};

exports.findUserByEmail = async (email) => {
    const sql = 'SELECT * FROM USERS WHERE email = ? AND deleted_at IS NULL';
    const [rows] = await db.execute(sql, [email]);
    return rows;
};

exports.findUserById = async (userId) => {
    const sql = 'SELECT * FROM USERS WHERE user_id = ? AND deleted_at IS NULL';
    const [rows] = await db.execute(sql, [userId]);
    return rows[0];
};

exports.updatePassword = async (userId, hash) => {
    const updateSql = 'UPDATE USERS SET password = ? WHERE user_id = ?';
    await db.execute(updateSql, [hash, userId]);
};

exports.updateUser = async (userId, userData, avatar) => {
    const updateSql = avatar
        ? 'UPDATE USERS SET nickname = ?, email = ?, avatar = ? WHERE user_id = ?'
        : 'UPDATE USERS SET nickname = ?, email = ? WHERE user_id = ?';
    const params = avatar
        ? [userData.nickname, userData.email, avatar, userId]
        : [userData.nickname, userData.email, userId];

    await db.execute(updateSql, params);

    const sql = 'SELECT * FROM USERS WHERE user_id = ? AND deleted_at IS NULL';
    const [updatedUserRows] = await db.execute(sql, [userId]);
    return updatedUserRows[0];
};

exports.deleteUser = async (connection, userId) => {
    const deleteUserSql = 'UPDATE USERS SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL';
    const [result] = await connection.execute(deleteUserSql, [userId]);
    if (result.affectedRows === 0) {
        throw new appError('User not found', 404);
    }
};

exports.findPostsByUserId = async (connection, userId) => {
    const postImageSql = 'SELECT post_id FROM POSTS WHERE creator = ? AND deleted_at IS NULL';
    const [posts] = await connection.execute(postImageSql, [userId]);
    return posts;
};

exports.deletePost = async (connection, postId) => {
    const deletePostSql = 'UPDATE POSTS SET deleted_at = CURRENT_TIMESTAMP WHERE post_id = ?';
    await connection.execute(deletePostSql, [postId]);
};

exports.deleteComments = async (connection, userId) => {
    const deleteCommentsSql = 'UPDATE COMMENTS SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ?';
    await connection.execute(deleteCommentsSql, [userId]);
};

exports.findUserById = async (user_id) => {
    const sql = 'SELECT * FROM USERS WHERE user_id = ? AND deleted_at IS NULL';
    const [rows] = await db.execute(sql, [user_id]);
    return rows.length > 0 ? rows[0] : null;
};
