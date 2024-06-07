const db = require('../../db');

exports.getAllWord = async (limit, skip) => {
    const wordsSql = `
        SELECT 
          w.*, 
          u.avatar AS creator_avatar, 
          u.nickname AS creator_nickname
        FROM words as w
        JOIN USERS as u ON w.user_id = u.user_id 
        WHERE w.deleted_at IS NULL 
        ORDER BY w.created_at DESC
        LIMIT ? OFFSET ?`;
    // NOTE : Incorrect arguments to mysqld_stmt_execute 때문에 string으로 임시 변환 처리
    const [words] = await db.execute(wordsSql, [limit + '', skip + '']);
    return words;
};

exports.getSearchResult = async (keyword) => {
    const wordSql = `
     SELECT 
          w.*, 
          u.avatar AS creator_avatar, 
          u.nickname AS creator_nickname
        FROM words as w
        JOIN USERS as u ON w.user_id = u.user_id 
        WHERE w.deleted_at IS NULL AND w.title LIKE ?
        ORDER BY w.created_at DESC`;
    const [words] = await db.execute(wordSql, [`%${keyword}%`]);
    return words;
};
