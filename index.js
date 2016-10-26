// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const reddit = require('./reddit.js');
const mysql = require('mysql');

const app = express();

// Specify the usage of the Pug template engine
app.set('view engine', 'pug');

// Middleware
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
app.use(bodyParser.urlencoded({extended: false}));

// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
app.use(cookieParser());

// This middleware will console.log every request to your web server! Read the docs for more info!
app.use(morgan('dev'));

// Acces to the database
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqltemppassword',
  database : 'reddit'
});

const redditAPI = reddit(connection);

// Resources
app.get('/', function(request, response) {
  var rank;
  if (request.query.sort === 'new') {
    rank = 'new';
  }
  else if (request.query.sort === 'top') {
    rank = 'top';
  }
  else {rank = 'hot';}

  redditAPI.getAllPosts(rank, {numPerPage: 25, page: 0})
  .then(function(posts) {
    response.render('post-list', {posts: posts});
  })
  .catch(function(err) {
    response.status(500).send(`${err}`);
  })
});

app.get('/login', function(request, response) {
  response.render('login-page');
});

app.post('/login', function(request, response) {
  // code to login a user
  // hint: you'll have to use response.cookie here
});

app.get('/signup', function(request, response) {
  response.render('signup-page');
});

app.post('/signup', function(request, response) {
  redditAPI.createUser({'username': request.body.username, 'password': request.body.password})
  .then(function(result) {
    response.redirect('/login');
  })
  .catch(function(err) {
    response.status(500).send(`${err}`);
  })
});

app.post('/vote', function(request, response) {
  // code to add an up or down vote for a content+user combination
});

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
const server = app.listen((process.env.PORT || 3000), (process.env.IP || '127.0.0.1'), function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Web Server is listening at http://%s:%s', host, port);
});

// On browser
// http://127.0.0.1:3000/