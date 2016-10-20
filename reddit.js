var core = require('./library/basicpromises.js');
var HASH_ROUNDS = 10;
var insertUser = `
  INSERT INTO users 
  (username, password, createdAt, updatedAt) 
  VALUES (?, ?, ?, ?)
`;
var insertPost = `
  INSERT INTO posts 
  (userId, title, url, createdAt, updatedAt) 
  VALUES (?, ?, ?, ?, ?);
`;
var selectUserId = `
  SELECT id, username, createdAt, updatedAt
  FROM users
  WHERE id = ?;
`;
var selectPostId = `
  SELECT id,title,url,userId, createdAt, updatedAt 
  FROM posts 
  WHERE id = ?
`;

module.exports = function RedditAPI(conn) {

  var connQuery = core.makeConnQuery(conn);

  return {
    createUser: function createUser(user) {
      return core.crypt(user.password, HASH_ROUNDS)
      .then(function(hashedPassword) {

        return connQuery(insertUser, [user.username, hashedPassword, new Date(), new Date()])
      })
      .then(function(result) {

        return connQuery(selectUserId, [result.insertId])
      })
      .then(function(result) {

        return result[0];
      })
      .catch(function(error) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new Error('A user with this username already exist');
        }
        else {
          throw new Error(error);
        }
      })
    },
    createPost: function createPost(post) {
      return connQuery(insertPost, [post.userId, post.title, post.url, new Date(), new Date()])
      .then(function(result) {

        return connQuery(selectPostId, [result.insertId])
      })
      .then(function(result) {
        return result[0];
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },
    getAllPosts: function getAllPosts(options) {
      if (!options) {
        options = {};
      }
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;

      return connQuery(`
        SELECT id, title, url, userId, createdAt, updatedAt
            FROM posts
            ORDER BY createdAt DESC
            LIMIT ? OFFSET ?`
            , [limit, offset])
      .catch(function(error) {
        throw new Error(error);
      })
    }
  }
}

