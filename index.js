//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const reddit = require('./library/reddit.js');
const mysql = require('mysql');

const app = express();

app.locals.pretty = true;

// Specify the usage of the Pug template engine
app.set('view engine', 'pug');

//////////////////////////////////////////////////////////////////////////////////////////
// Middleware
// Parse the POST requests coming from an HTML form, and put the result in req.body
app.use(bodyParser.urlencoded({extended: false}));

// Parse the Cookie header from all requests, and put the result in req.cookies
app.use(cookieParser());
app.use(checkLoginToken);

// Console.log every request to the web server
app.use(morgan('dev'));

// Acces to the database
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqltemppassword',
  database : 'reddit'
});

const redditAPI = reddit(connection);

////////////////////////////////////////////////////////////////////////////////////////////
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
    response.status(500).send(`${err.stack}`);
  })
});

app.get('/login', function(request, response) {
  response.render('login-page');
});

app.post('/login', function(request, response) {
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

app.get('/signup', function(request, response) {
  response.render('signup-page');
});

app.post('/signup', function(request, response) {
  redditAPI.createUser({'username': request.body.username, 'password': request.body.password})
  .then(function(result) {
    response.redirect('/login');
  })
  .catch(function(err) {
    response.status(500).send(`${err.stack}`);
  })
});

app.get('/createPost', function(request, response) {
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

app.post('/createPost', function(request, response) {
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

app.post('/vote', function(request, response) {
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

app.get('/logout', function(request, response) {
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Start up the web server
const server = app.listen((process.env.PORT || 3000), (process.env.IP || '127.0.0.1'), function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Web Server is listening at http://%s:%s', host, port);
});

// On browser
// http://127.0.0.1:3000/