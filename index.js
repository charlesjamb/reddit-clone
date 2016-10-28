// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const reddit = require('./reddit.js');
const mysql = require('mysql');

const server = express();

server.locals.pretty = true;

// Specify the usage of the Pug template engine
server.set('view engine', 'pug');

// Middleware
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
server.use(bodyParser.urlencoded({extended: false}));

// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
server.use(cookieParser());
server.use(checkLoginToken);

// This middleware will console.log every request to your web server! Read the docs for more info!
server.use(morgan('dev'));

// Acces to the database
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqltemppassword',
  database : 'reddit'
});

const redditAPI = reddit(connection);

// Resources
server.get('/', function(request, response) {
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
    response.status(500).send(`${err.stack}`);
  })
});

server.get('/login', function(request, response) {
  response.render('login-page');
});

server.post('/login', function(request, response) {
  redditAPI.checkLogin(request.body.username, request.body.password)
  .then(function(user) {
    
    return redditAPI.createSession(user.id)
    .then(function(token) {
        response.cookie('SESSION', token);
        response.redirect('/');
    })  
  })
  .catch(function(err) {
    response.send(`${err.stack}`)
  })
});

server.get('/signup', function(request, response) {
  response.render('signup-page');
});

server.post('/signup', function(request, response) {
  redditAPI.createUser({'username': request.body.username, 'password': request.body.password})
  .then(function(result) {
    response.redirect('/login');
  })
  .catch(function(err) {
    response.status(500).send(`${err.stack}`);
  })
});

server.get('/createPost', function(request, response) {
  if (!request.loggedInUser) {
    response.render('error');
  }
  else {
    redditAPI.getAllSubreddit()
    .then(function(subs) {
      response.render('create-content', {subs: subs});
    })
    .catch(function(err) {
      response.send(`${err.stack}`)
    })
  }
})

server.post('/createPost', function(request, response) {
  redditAPI.createPost({
    'userId': request.loggedInUser[0].userId,
    'title': request.body.title,
    'url': request.body.url,
    'subredditId': request.body.selectedSub
  })
  .then(function(result) {
    response.redirect('/?sort=new');
  })
  .catch(function(err) {
    response.send(`${err.stack}`);
  })
})

server.post('/vote', function(request, response) {
  if (!request.loggedInUser) {
    response.render('error');
  }
  else {
    redditAPI.createVote({
      'postId': request.body.postId,
      'userId': request.loggedInUser[0].userId,
      'vote': request.body.vote,
    })
    .then(function(result) {
      response.redirect('/');
    })
    .catch(function(err) {
      response.send(`${err}`);
    })
  }
})

server.get('/logout', function(request, response) {
  if (request.loggedInUser) {
    redditAPI.deleteCookie(request.loggedInUser[0].token)
    .then(function(result) {
      response.clearCookie('SESSION')
      response.render('logout')
    })
    .catch(function(err) {
      response.send(`${err}`);
    })
  }
  else {
    response.render('logout');
  }
})

function checkLoginToken(request, response, next) {
  if (request.cookies.SESSION) {
    redditAPI.getUserFromSession(request.cookies.SESSION)
    .then(function(user) {
      if (user) {
                console.log(user[0]);
        console.log(user);
        request.loggedInUser = user;
        response.locals.user = user[0];
      }
      next();
    })
  }
  else {
    next();
  }
}

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
const index = server.listen((process.env.PORT || 3000), (process.env.IP || '127.0.0.1'), function () {
  const host = index.address().address;
  const port = index.address().port;

  console.log('Web Server is listening at http://%s:%s', host, port);
});

// On browser
// http://127.0.0.1:3000/