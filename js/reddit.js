const core = require('./basicpromises.js');
const secureRandom = require('secure-random');
const q = require('./queries'); 
const HASH_ROUNDS = 10;

///////////////////////////////////////////////////////////////////////////////
// API functions
function createSessionToken() {
  return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
}

module.exports = function RedditAPI(conn) {
  const connQuery = core.makeConnQuery(conn);
  return {

    ///////////////////////////////////////////////////////////////////////////
    createUser: function createUser(user) {
      return core.crypt(user.password, HASH_ROUNDS)
      .then(function(hashedPassword) {

        return connQuery(q.insertUser, [user.username, hashedPassword, new Date(), new Date()])
      })
      .then(function(result) {

        return connQuery(q.selectUserId, [result.insertId])
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
    ///////////////////////////////////////////////////////////////////////////
    createPost: function createPost(post) {
      return connQuery(q.insertPost, [post.userId, post.title, post.url, new Date(), new Date(), post.subredditId])
      .then(function(result) {

        return connQuery(q.selectPostId, [result.insertId])
      })
      .then(function(result) {
        return result[0];
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    createSubreddit: function createSubreddit(sub) {
      return connQuery(q.insertSub, [sub.name, sub.description, new Date(), new Date()])
      .then(function(result) {

        return connQuery(q.selectSubId, [result.insertId])
      })
      .then(function(result) {
        return result[0];
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    getAllPosts: function getAllPosts(ranking, options) {
      if (!options) {
        options = {};
      }
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;

      if (ranking === 'top') {
        var rank = 'voteScore DESC ';
      }
      else if (ranking === 'hot') {
        var rank = 'sum(votes.vote) / (current_timestamp - posts.createdAt)';
      }
      else {
        var rank = 'posts.createdAt DESC ';
      }
      var queryAll  = q.allPostsQuery(rank);
      return connQuery(queryAll, [limit, offset])
      .then(function(result) {
        return result.map(function(data) {
          return {
            'postId': data.postId,
            'postTitle': data.postTitle,
            'postUrl': data.postUrl,
            'postCreatedAt': data.postCreatedAt,
            'postUpdatedAt': data.postUpdatedAt,
            'postUserId': data.postUser,
            'postScore': data.voteScore,
            'upvotes': data.upvotes,
            'downvotes': data.downvotes,
            'user': {
              'userId': data.userId,
              'username': data.username,
              'createdAt': data.userCreatedAt,
              'updatedAt': data.userUpdatedAt
            },
            'subreddit': {
              'subId': data.subId,
              'subName': data.subName,
              'subDescription': data.subDescription,
              'subCreatedAt' : data.subCreatedAt,
              'subUpdatedAt': data.subUpdatedAt
            }
          }          
        })
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    getAllSubreddit: function getAllSubreddit() {
      return connQuery(q.selectAllSubs)
      .then(function(result) {
        return result.map(function(data) {
          return {
            'subId': data.subId,
            'subName': data.subName,
            'subDescription': data.subDescription,
            'subCreatedAt': data.subCreatedAt,
            'subUpdatedAt': data.subUpdatedAt
          }
        })
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    getAllPostsForUser: function getAllPostsForUser(userId, options) {
      if (!options) {
        options = {};
      }
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;

      return connQuery(q.selectAllPostsForUser, [userId, limit, offset])
      .then(function(result) {
        return result.map(function(data) {
          return {
            'postId': data.postId,
            'postTitle': data.postTitle,
            'postUrl': data.postUrl,
            'postCreatedAt': data.postCreatedAt,
            'postUpdatedAt': data.postUpdatedAt,
            'postUserId': data.postUser,
            'user': {
              'userID': data.userId,
              'username': data.username,
              'createdAt': data.userCreatedAt,
              'updatedAt': data.userUpdatedAt
            },
            'subreddit': {
              'subId': data.subId,
              'subName': data.subName,
              'subDescription': data.subDescription,
              'subCreatedAt' : data.subCreatedAt,
              'subUpdatedAt': data.subUpdatedAt
            }
          }
        }) 
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    getSinglePost: function getSinglePost(postId) {
      return connQuery(q.selectSinglePost, postId)
      .then(function(data) {
        return {
          'postId': data[0].postId,
          'postTitle': data[0].postTitle,
          'postUrl': data[0].postUrl,
          'postCreatedAt': data[0].postCreatedAt,
          'postUpdatedAt': data[0].postUpdatedAt,
          'postUserId': data[0].postUser,
          'user': {
            'userId': data[0].userId,
            'username': data[0].username,
            'createdAt': data[0].userCreatedAt,
            'updatedAt': data[0].userUpdatedAt
          },
          'subreddit': {
            'subId': data[0].subId,
            'subName': data[0].subName,
            'subDescription': data[0].subDescription,
            'subCreatedAt' : data[0].subCreatedAt,
            'subUpdatedAt': data[0].subUpdatedAt
          }
        }
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    createVote: function createVote(vote) {
      vote.vote = parseInt(vote.vote);
      if (vote.vote === -1 || vote.vote === 0 || vote.vote === 1) { 
        return connQuery(q.voteQuery, [vote.postId, vote.userId, vote.vote, vote.vote])
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
      else {
        throw new Error(error)}
    },

    ///////////////////////////////////////////////////////////////////////////
    checkLogin: function checkLogin(user, password) {
      return connQuery('SELECT * FROM users WHERE username = ?', [user])
      .then(function(result) {
        if (result.length === 0) {
          throw new Error('username or password incorrect');
        }
        else {
          var user = result[0];
          var actualHashedPassword = user.password;

          return core.hashCompare(password, actualHashedPassword)
          .then(function(result){
            if (result === true) {
              return user;
            }
            else {
              throw new Error('username or password incorrect');
            }
          })
        }
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    createSession: function createSession(userId) {
      var token = createSessionToken();
      return connQuery('INSERT INTO sessions SET userId = ?, token = ?', [userId, token])
      .then(function(result) {
        return token;
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    getUserFromSession: function getUserFromSession(cookie) {
      return connQuery('SELECT * FROM sessions WHERE token = ?', [cookie])
      .then(function(result) {
        if (result) {
          return result;
        }
        else {throw new Error('user unknown')}
      })
      .catch(function(error) {
        throw new Error(error);
      })
    },

    ///////////////////////////////////////////////////////////////////////////
    deleteCookie: function deleteCookie(token) {
      return connQuery(q.deleteCookieQuery, [token])
      .then(function(result) {
        return result;
      })
      .catch(function(error) {
        throw new Error(error);
      })
    }
  }
} 