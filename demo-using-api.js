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
    username: 'A wild user appear46',
    password: 'xxxx'
    })
  .then(function(user) {
    return redditAPI.createPost({
      title: 'Another WTF post',
      url: 'https://example.com',
      subredditId: '9',
      userId: user.id
    })
  })
  .then(function(post) {
    console.log(JSON.stringify(post, null, 4));
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

function newSub() {
  redditAPI.createSubreddit({
    name: 'WTF',
    description: 'Some gross and weird stuffs',
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
allPosts('hot');
// allPostsForUser(1);
// singlePost(23);
// newSub();
// allSubs();
// voted();