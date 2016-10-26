
// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

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

/*
IMPORTANT!!!!!!!!!!!!!!!!!
Before defining our web resources, we will need access to our RedditAPI functions.
You will need to write (or copy) the code to create a connection to your MySQL database here, and import the RedditAPI.
Then, you'll be able to use the API inside your app.get/app.post functions as appropriate.
*/


// Resources
app.get('/', function(request, response) {
  /*
  Your job here will be to use the RedditAPI.getAllPosts function to grab the real list of posts.
  For now, we are simulating this with a fake array of posts!
  */
  var posts = [
    {
      id: 123,
      title: 'Check out this cool site!',
      url: 'https://www.decodemtl.com/',
      user: {
        id: 42,
        username: 'cool_dude'
      }
    },
    {
      id: 400,
      title: 'This is SPARTA!!!',
      url: 'http://www.SPARTA.com/',
      user: {
        id: 222,
        username: 'Merilize'
      }
    }
  ];

  /*
  Response.render will call the Pug module to render your final HTML.
  Check the file views/post-list.pug as well as the README.md to find out more!
  */
  response.render('post-list', {posts: posts});
});

app.get('/login', function(request, response) {
  // code to display login form
});

app.post('/login', function(request, response) {
  // code to login a user
  // hint: you'll have to use response.cookie here
});

app.get('/signup', function(request, response) {
  // code to display signup form
});

app.post('/signup', function(request, response) {
  // code to signup a user
  // ihnt: you'll have to use bcrypt to hash the user's password
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