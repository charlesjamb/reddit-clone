module.exports = {
	
	"insertUser": `
	  INSERT INTO users 
	  (username, password, createdAt, updatedAt) 
	  VALUES (?, ?, ?, ?)
	`,

	"insertPost": `
	  INSERT INTO posts 
	  (userId, title, url, createdAt, updatedAt, subredditId) 
	  VALUES (?, ?, ?, ?, ?, ?)
	`,

	"insertSub": `
	  INSERT INTO subreddit
	  (name, description, createdAt, updatedAt) 
	  VALUES (?, ?, ?, ?)
	`,

	"selectUserId": `
	  SELECT id, username, createdAt, updatedAt
	  FROM users
	  WHERE id = ?
	`,

	"selectPostId": `
	  SELECT id, title, url, userId, createdAt, updatedAt, subredditId 
	  FROM posts 
	  WHERE id = ?
	`,

	"selectSubId": `
	  SELECT id, name, description, createdAt, updatedAt
	  FROM subreddit
	  WHERE id = ?
	`,

	allPostsQuery: function allPostsQuery(rank) { 
	  return  `
	    SELECT
	      posts.id AS "postId", 
	      posts.title AS "postTitle", 
	      posts.url AS "postUrl", 
	      posts.userId AS "postUser", 
	      users.id AS "userId",
	      posts.createdAt AS "postCreatedAt",
	      posts.updatedAt AS "postUpdatedAt",
	      users.username AS "username", 
	      users.createdAt AS "userCreatedAt", 
	      users.updatedAt AS "userUpdatedAt",
	      subreddit.id AS "subId",
	      subreddit.name AS "subName",
	      subreddit.description AS "subDescription",
	      subreddit.createdAt AS "subCreatedAt",
	      subreddit.updatedAt AS "subUpdatedAt",
	      SUM(votes.vote) AS "voteScore",
	      SUM(votes.vote = "1") AS "upvotes",
	      SUM(votes.vote = "-1") AS "downvotes"
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
	},

	"selectAllSubs": `
	  SELECT
	    subreddit.id AS "subId",
	    subreddit.name AS "subName",
	    subreddit.description AS "subDescription",
	    subreddit.createdAt AS "subCreatedAt",
	    subreddit.updatedAt AS "subUpdatedAt"
	  FROM subreddit
	  ORDER BY subCreatedAt DESC
	`,

	"selectAllPostsForUser": `
	  SELECT
	    posts.id AS "postId", 
	    posts.title AS "postTitle", 
	    posts.url AS "postUrl", 
	    posts.userId AS "postUser",
	    posts.createdAt AS "postCreatedAt",
	    posts.updatedAt AS "postUpdatedAt",
	    users.id AS "userId", 
	    users.username AS "username", 
	    users.createdAt AS "userCreatedAt", 
	    users.updatedAt AS "userUpdatedAt",
	    subreddit.id AS "subId",
	    subreddit.name AS "subName",
	    subreddit.description AS "subDescription",
	    subreddit.createdAt AS "subCreatedAt",
	    subreddit.updatedAt AS "subUpdatedAt"
	  FROM posts
	  JOIN users 
	    ON (users.id = posts.userId)
	  JOIN subreddit
	    ON (subreddit.id = posts.subredditId)
	  WHERE userId = ?
	  ORDER BY posts.createdAt DESC
	  LIMIT ? OFFSET ?
	`,

	"selectSinglePost": `
	  SELECT
	    posts.id AS "postId", 
	    posts.title AS "postTitle", 
	    posts.url AS "postUrl",
	    posts.createdAt AS "postCreatedAt",
	    posts.updatedAt AS "postUpdatedAt",
	    posts.userId AS "postUser", 
	    users.id AS "userId", 
	    users.username AS "username", 
	    users.createdAt AS "userCreatedAt", 
	    users.updatedAt AS "userUpdatedAt",
	    subreddit.id AS "subId",
	    subreddit.name AS "subName",
	    subreddit.description AS "subDescription",
	    subreddit.createdAt AS "subCreatedAt",
	    subreddit.updatedAt AS "subUpdatedAt"
	  FROM posts
	  JOIN users 
	    ON (users.id = posts.userId)
	  JOIN subreddit
	    ON (subreddit.id = posts.subredditId)
	  WHERE posts.id = ?
	  LIMIT 1
	`,

	"voteQuery": `
	  INSERT INTO votes 
	  SET postId=?, userId=?, vote=? 
	  ON DUPLICATE KEY UPDATE vote=?;
	`,

	"getVote": `
	  SELECT
	    postId,
	    userId, 
	    vote
	  FROM votes  
	  WHERE postId = ?
	`,

	"deleteCookieQuery": `
	  DELETE FROM sessions
	  WHERE token = ?
	`
};