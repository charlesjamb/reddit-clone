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
    username: 'hello6',
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
}

function allPosts() {
  redditAPI.getAllPosts()
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.log(error);
  })
}

newUserAndpost();
allPosts();