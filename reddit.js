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
  VALUES (?, ?, ?, ?, ?)
`;
var selectUserId = `
  SELECT id, username, createdAt, updatedAt
  FROM users
  WHERE id = ?
`;
var selectPostId = `
  SELECT id,title,url,userId, createdAt, updatedAt 
  FROM posts 
  WHERE id = ?
`;
var selectAllPosts = `
  SELECT
    posts.id AS "postID", 
    posts.title AS "postTitle", 
    posts.url AS "postUrl", 
    posts.userId AS "postUser", 
    users.id AS "userID", 
    users.username AS "username", 
    users.createdAt AS "userCreatedAt", 
    users.updatedAt AS "userUpdatedAt"
  FROM posts
  JOIN users 
  ON (users.id = posts.userId)
  ORDER BY posts.createdAt DESC
  LIMIT ? OFFSET ?
`;
var selectAllPostsForUser = `
    SELECT
    posts.id AS "postID", 
    posts.title AS "postTitle", 
    posts.url AS "postUrl", 
    posts.userId AS "postUser", 
    users.id AS "userID", 
    users.username AS "username", 
    users.createdAt AS "userCreatedAt", 
    users.updatedAt AS "userUpdatedAt"
  FROM posts
  JOIN users 
  ON (users.id = posts.userId)
  WHERE userID = ?
  ORDER BY posts.createdAt DESC
  LIMIT ? OFFSET ?
`;
var selectSinglePost = `
  SELECT
    posts.id AS "postID", 
    posts.title AS "postTitle", 
    posts.url AS "postUrl", 
    posts.userId AS "postUser", 
    users.id AS "userID", 
    users.username AS "username", 
    users.createdAt AS "userCreatedAt", 
    users.updatedAt AS "userUpdatedAt"
  FROM posts
  JOIN users 
  ON (users.id = posts.userId)
  WHERE posts.id = ?
  LIMIT 1
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

      return connQuery(selectAllPosts, [limit, offset])
      .then(function(result) {
        return result.map(function(data) {
          return {
            'PostID': data.postID,
            'PostTitle': data.postTitle,
            'PostURL': data.postUrl,
            'PostUserID': data.postUser,
            'User': {
              'UserID': data.userID,
              'Username': data.username,
              'CreatedAt': data.userCreatedAt,
              'UpdatedAt': data.userUpdatedAt
            }
          }          
        })
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },
    getAllPostsForUser: function getAllPostsForUser(userId, options) {
      if (!options) {
        options = {};
      }
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;

      return connQuery(selectAllPostsForUser, [userId, limit, offset])
      .then(function(result) {
        return result.map(function(data) {
          return {
            'PostID': data.postID,
            'PostTitle': data.postTitle,
            'PostURL': data.postUrl,
            'PostUserID': data.postUser,
            'User': {
              'UserID': data.userID,
              'Username': data.username,
              'CreatedAt': data.userCreatedAt,
              'UpdatedAt': data.userUpdatedAt
            }
          }
        }) 
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },
    getSinglePost: function getSinglePost(postId) {
      return connQuery(selectSinglePost, postId)
      .then(function(data) {
        var singlePostObj = {
          'PostID': data[0].postID,
          'PostTitle': data[0].postTitle,
          'PostURL': data[0].postUrl,
          'PostUserID': data[0].postUser,
          'User': {
            'UserID': data[0].userID,
            'Username': data[0].username,
            'CreatedAt': data[0].userCreatedAt,
            'UpdatedAt': data[0].userUpdatedAt
          }
        }
        return singlePostObj;
      })
      .catch(function(error) {
        throw new Error(error);
      })
    }
  }
}

