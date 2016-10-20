var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqltemppassword',
  database : 'reddit'
});

var reddit = require('./reddit.js');
var redditAPI = reddit(connection);

function newUserAndpost() {
  redditAPI.createUser({
    username: 'hello7',
    password: 'xxxx'
    })
  .then(function(user) {
    console.log(user);

    return redditAPI.createPost({
      title: 'hi reddit',
      url: 'https://reddit.com',
      userId: user.id
    })
  })
  .then(function(post) {
    console.log(post);
  })
  .catch(function(error) {
    console.log(error);
  })
  connection.end();
}

function newSub() {
  redditAPI.createSubreddit({
    name: 'pics5',
    // description: 'This was for beautiful pics but now it is for every pics that will get you some karma',
  })
  .then(function(result) {
    console.log(result);
    connection.end();
  })
  .catch(function(error) {
    console.log(error);
    connection.end();
  })
}

function allPosts() {
  redditAPI.getAllPosts()
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.log(error);
  })
  connection.end();
}

function allSubs() {
  redditAPI.getAllSubreddit()
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.log(error);
  })
  connection.end();
}

function allPostsForUser(userId) {
  redditAPI.getAllPostsForUser(userId)
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.log(error);
  })
  connection.end();
}

function singlePost(postId) {
  redditAPI.getSinglePost(postId)
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.log(error);
  })
  connection.end();
}


// newUserAndpost();
// allPosts();
// allPostsForUser(13);
// singlePost(3);
// newSub();
allSubs();