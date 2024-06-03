const db = require('../../db');

exports.getAllPost = async (limit, skip) => {
    const postsSql = `
        SELECT 
          p.*, 
          u.avatar AS creator_avatar, 
          u.nickname AS creator_nickname
        FROM posts as p
        JOIN USERS as u ON p.user_id = u.user_id 
        WHERE p.deleted_at IS NULL 
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`;
    // NOTE : Incorrect arguments to mysqld_stmt_execute 때문에 string으로 임시 변환 처리
    const [posts] = await db.execute(postsSql, [limit + '', skip + '']);
    return posts;
};

exports.getSinglePost = async (post_id) => {
    const postSql = `
      SELECT 
        POSTS.*, 
        USERS.avatar AS creator_avatar, 
        USERS.nickname AS creator_nickname
      FROM POSTS 
      JOIN USERS ON POSTS.user_id = USERS.user_id 
      WHERE POSTS.post_id = ? AND POSTS.deleted_at IS NULL`;
    const [posts] = await db.execute(postSql, [post_id]);
    return posts.length ? posts[0] : null;
};

exports.getCommentsByPostId = async (post_id) => {
    const commentsSql = `
      SELECT 
        COMMENTS.*, 
        USERS.avatar AS creator_avatar, 
        USERS.nickname AS creator_nickname
      FROM COMMENTS 
      JOIN USERS ON COMMENTS.user_id = USERS.user_id 
      WHERE COMMENTS.post_id = ? AND COMMENTS.deleted_at IS NULL`;
    const [comments] = await db.execute(commentsSql, [post_id]);
    return comments;
};

exports.incrementViewCount = async (post_id) => {
    const updateViewCountSql = 'UPDATE POSTS SET count_view = count_view + 1 WHERE post_id = ?';
    await db.execute(updateViewCountSql, [post_id]);
};

exports.createPost = async (newPost) => {
    const createPostSql = `
      INSERT INTO POSTS (title, content, post_image, user_id)
      VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(createPostSql, Object.values(newPost));
    newPost.post_id = result.insertId;
    return newPost;
};

exports.updatePost = async (post_id, updateData) => {
    const { title, content, post_image } = updateData;
    const updateSql = post_image
        ? 'UPDATE POSTS SET title = ?, content = ?, post_image = ? WHERE post_id = ?'
        : 'UPDATE POSTS SET title = ?, content = ? WHERE post_id = ?';
    const params = post_image ? [title, content, post_image, post_id] : [title, content, post_id];
    await db.execute(updateSql, params);
};

exports.deletePost = async (post_id) => {
    const deletePostSql = 'UPDATE POSTS SET deleted_at = CURRENT_TIMESTAMP WHERE post_id = ?';
    await db.execute(deletePostSql, [post_id]);
};

exports.createComment = async (newComment) => {
    const createCommentSql = `
      INSERT INTO COMMENTS (post_id, user_id, content)
      VALUES (?, ?, ?)`;
    await db.execute(createCommentSql, Object.values(newComment));
};

exports.incrementCommentCount = async (post_id) => {
    const updateCommentCountSql = 'UPDATE POSTS SET count_comment = count_comment + 1 WHERE post_id = ?';
    await db.execute(updateCommentCountSql, [post_id]);
};

exports.updateComment = async (post_id, comment_id, comment) => {
    const updateCommentSql = 'UPDATE COMMENTS SET content = ? WHERE comment_id = ? AND post_id = ?';
    await db.execute(updateCommentSql, [comment, comment_id, post_id]);
};

exports.deleteComment = async (connection, post_id, comment_id) => {
    const deleteCommentSql = 'UPDATE COMMENTS SET deleted_at = CURRENT_TIMESTAMP WHERE comment_id = ? AND post_id = ?';
    await connection.execute(deleteCommentSql, [comment_id, post_id]);
};

exports.decrementCommentCount = async (connection, post_id) => {
    const updateCommentCountSql = 'UPDATE POSTS SET count_comment = count_comment - 1 WHERE post_id = ?';
    await connection.execute(updateCommentCountSql, [post_id]);
};

exports.getConnection = async () => {
    return await db.getConnection();
};
