const mysql = require('mysql');

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqltemppassword',
  database : 'reddit'
});

const reddit = require('./reddit.js');
const redditAPI = reddit(connection);

function newUserAndpost() {
  redditAPI.createUser({
    username: 'A wild user appear44',
    password: 'xxxx'
    })
  .then(function(user) {
    console.log(user);

    return redditAPI.createPost({
      title: 'hi reddit',
      url: 'https://reddit.com',
      subredditId: '1',
      userId: user.id
    })
  })
  .then(function(post) {
    console.log(JSON.stringify(result, null, 4));
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

function newSub() {
  redditAPI.createSubreddit({
    name: 'pics5',
    // description: 'This was for beautiful pics but now it is for every pics that will get you some karma',
  })
  .then(function(result) {
    console.log(JSON.stringify(result, null, 4));
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

function allPosts(ranking) {
  redditAPI.getAllPosts(ranking)
  .then(function(result) {
    console.log(JSON.stringify(result, null, 4));
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

function allSubs() {
  redditAPI.getAllSubreddit()
  .then(function(result) {
    console.log(JSON.stringify(result, null, 4));
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

function allPostsForUser(userId) {
  redditAPI.getAllPostsForUser(userId)
  .then(function(result) {
    console.log(JSON.stringify(result, null, 4));
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

function singlePost(postId) {
  redditAPI.getSinglePost(postId)
  .then(function(result) {
    console.log(JSON.stringify(result, null, 4));
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

function voted() {
  redditAPI.createVote({
    postId: 3,
    userId: 3,
    vote: 1
  })
  .then(function(result) {
    console.log(JSON.stringify(result, null, 4));
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

// TODO add subreddit to all functions

// newUserAndpost();
// allPosts();
allPostsForUser(1);
// singlePost(3);
// newSub();
// allSubs();
// voted();