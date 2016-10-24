var core = require('./library/basicpromises.js');
var HASH_ROUNDS = 10;
var insertUser = `
  INSERT INTO users 
  (username, password, createdAt, updatedAt) 
  VALUES (?, ?, ?, ?)
`;
var insertPost = `
  INSERT INTO posts 
  (userId, title, url, createdAt, updatedAt, subredditId) 
  VALUES (?, ?, ?, ?, ?, ?)
`;
var insertSub = `
  INSERT INTO subreddit
  (name, description, createdAt, updatedAt) 
  VALUES (?, ?, ?, ?)
`;
var selectUserId = `
  SELECT id, username, createdAt, updatedAt
  FROM users
  WHERE id = ?
`;
var selectPostId = `
  SELECT id, title, url, userId, createdAt, updatedAt, subredditId 
  FROM posts 
  WHERE id = ?
`;
var selectSubId = `
  SELECT id, name, description, createdAt, updatedAt
  FROM subreddit
  WHERE id = ?
`;
function allPostsQuery(rank) { 
  return  `
    SELECT
      posts.id AS "postID", 
      posts.title AS "postTitle", 
      posts.url AS "postUrl", 
      posts.userId AS "postUser", 
      users.id AS "userID",
      posts.createdAt,
      users.username AS "username", 
      users.createdAt AS "userCreatedAt", 
      users.updatedAt AS "userUpdatedAt",
      subreddit.id AS "subID",
      subreddit.name AS "subName",
      subreddit.description AS "subDescription",
      subreddit.createdAt AS "subCreated",
      subreddit.updatedAt AS "subUpdated",
      SUM(votes.vote) AS "voteScore"
    FROM posts
    JOIN users 
      ON (users.id = posts.userId)
    JOIN subreddit
      ON (subreddit.id = posts.subredditId)
    LEFT JOIN votes 
      ON (posts.id = votes.postId)
    GROUP BY posts.id
    ORDER BY `  +rank+
    `LIMIT ? OFFSET ?
  `;
}
var selectAllSubs = `
  SELECT
    subreddit.id AS "subID",
    subreddit.name AS "subName",
    subreddit.description AS "subDescription",
    subreddit.createdAt AS "subCreated",
    subreddit.updatedAt AS "subUpdated"
  FROM subreddit
  ORDER BY subCreated DESC
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
var voteQuery = `
  INSERT INTO votes 
  SET postId=?, userId=?, vote=? 
  ON DUPLICATE KEY UPDATE vote=?;
`;
var getVote = `
  SELECT
    postId,
    userId, 
    vote
  FROM votes  
  WHERE postId = ?
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
      return connQuery(insertPost, [post.userId, post.title, post.url, new Date(), new Date(), post.subredditId])
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
    createSubreddit: function createSubreddit(sub) {
      return connQuery(insertSub, [sub.name, sub.description, new Date(), new Date()])
      .then(function(result) {

        return connQuery(selectSubId, [result.insertId])
      })
      .then(function(result) {
        return result[0];
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },
    getAllPosts: function getAllPosts(ranking, options) {
      if (!options) {
        options = {};
      }
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;

      if (ranking === 'top') {
        var rank = 'voteScore DESC ';
      }
      // else if (ranking = 'hot') {
      //   var rank = 
      // }
      else {
        var rank = 'posts.createdAt DESC ';
      }
      var query = allPostsQuery(rank);
      return connQuery(query, [limit, offset])
      .then(function(result) {
        return result.map(function(data) {
          return {
            'PostID': data.postID,
            'PostTitle': data.postTitle,
            'PostURL': data.postUrl,
            'PostUserID': data.postUser,
            'PostScore': data.voteScore,
            'User': {
              'UserID': data.userID,
              'Username': data.username,
              'CreatedAt': data.userCreatedAt,
              'UpdatedAt': data.userUpdatedAt
            },
            'Subreddit': {
              'SubID': data.subID,
              'SubName': data.subName,
              'SubDescription': data.subDescription,
              'subCreated' : data.subCreated,
              'subUpdated': data.subUpdated
            }
          }          
        })
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },
    getAllSubreddit: function getAllSubreddit() {
      return connQuery(selectAllSubs)
      .then(function(result) {
        return result.map(function(data) {
          return {
            'SubID': data.subID,
            'SubName': data.subName,
            'SubDescription': data.subDescription,
            'CreatedAt': data.subCreated,
            'UpdatedAt': data.subUpdated
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
    },
    createVote: function createVote(vote) {
      if (vote.vote === -1 || vote.vote === 0 || vote.vote === 1) { 

        return connQuery(voteQuery, [vote.postId, vote.userId, vote.vote, vote.vote])
        .then(function(result) {

          return connQuery(getVote, [vote.postId])
        })
        .then(function(result) {
        return result; 
        })
        .catch(function(error) {
        throw new Error(error);
        })
      }
      else {throw new Error('invalid vote')}
    }
  }
}

