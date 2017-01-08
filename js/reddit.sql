-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(60) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- This creates the subreddit table.
CREATE TABLE `subreddit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NOT NULL,
  `description` VARCHAR(200) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);

-- Adding a subreddit columns to posts
ALTER TABLE `posts`
ADD COLUMN `subredditId` INT,
ADD FOREIGN KEY (subredditId) REFERENCES subreddit(id);

-- Adding the votes table
CREATE TABLE `votes` (
  `postId` INT NOT NULL,
  `userId` INT NOT NULL,
  `vote` TINYINT,
  PRIMARY KEY (userId, postId),
  FOREIGN KEY (postId) REFERENCES posts(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Adding the sessions table
CREATE TABLE `sessions` (
  `userId` INT NOT NULL,
  `token` VARCHAR(250),
  PRIMARY KEY (`token`),
  FOREIGN KEY (userId) REFERENCES users(id)
);