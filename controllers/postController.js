const fs = require('fs');
const path = require('path');

const postsJsonPath = path.join(__dirname, '../', 'data', 'posts.json');
let posts = JSON.parse(fs.readFileSync(postsJsonPath));

exports.getAllPost = (req, res) => {
    try {
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        //  page=5 & limit = 10  >>  40 data skip
        const skip = limit * (page - 1);

        let allPost = posts.slice(skip, limit * page);

        res.status(200).json({
            message: 'success',
            posts: allPost,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.getSinglePost = (req, res) => {
    try {
        const post_id = req.params.post_id;
        const post = posts.find((post) => post.id === post_id);
        res.status(200).json({
            message: 'success',
            post,
        });
    } catch (error) {
        console.log(error);
    }
};
