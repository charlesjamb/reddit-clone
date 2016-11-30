// TODO
// get rid of form for vote
// each btn data attribute that has postId
// value hardcoded on the backend
// selector on all the upvote make query


const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const core = require('./js/basicpromises.js');
const reddit = require('./js/reddit.js');
const mysql = require('mysql');

const app = express();

app.use('/styles', express.static('css'));
app.use('/scripts', express.static('js'));
app.use('/fonts', express.static('font'));
// Specify the usage of the Pug template engine
app.set('view engine', 'pug');

///////////////////////////////////////////////////////////////////////////////
// Middleware
// Parse the POST requests coming from an HTML form, and put the result in req.body
app.use(bodyParser.urlencoded({extended: false}));

// Parse the Cookie header from all requests, and put the result in req.cookies
app.use(cookieParser());
app.use(checkLoginToken);

// Console.log every request to the web server
app.use(morgan('dev'));

// Acces to the database
let connection;
if (process.env.CLEARDB_DATABASE_URL) {
  connection = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);
}
else { 
  connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'sqltemppassword',
    database : 'reddit'
  });
}

const redditAPI = reddit(connection);

app.locals.pretty = true;
app.locals.title = "Reddit Clone";

///////////////////////////////////////////////////////////////////////////////
// Resources
// Welcome
app.get('/', function(request, response) {
  response.render('welcome', {title: 'Welcome to Reddit Clone'});
});

///////////////////////////////////////////////////////////////////////////////
// Frontpage
app.get('/frontpage', function(request, response) {
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
    response.render('frontpage', {posts: posts, title: 'Frontpage'});
  })
  .catch(function(error) {
    response.status(500).send(`${error.stack}`);
  })
});

///////////////////////////////////////////////////////////////////////////////
// Sign in
app.get('/signin', function(request, response) {
  response.render('signIn', {title: 'Sign in'});
});

app.post('/signin', function(request, response) {
  redditAPI.checkLogin(request.body.username, request.body.password)
  .then(function(user) {
    
    return redditAPI.createSession(user.id)
    .then(function(token) {
        response.cookie('SESSION', token);
        response.redirect('/frontpage');
    })  
  })
  .catch(function(error) {
    response.send(`${error.stack}`)
  })
});

///////////////////////////////////////////////////////////////////////////////
// Sign up
app.get('/signup', function(request, response) {
  response.render('signUp', {title: 'Sign up'});
});

app.post('/signup', function(request, response) {
  redditAPI.createUser({'username': request.body.username, 'password': request.body.password})
  .then(function(result) {
    response.redirect('/signIn');
  })
  .catch(function(error) {
    response.status(500).send(`${error.stack}`);
  })
});

///////////////////////////////////////////////////////////////////////////////
// Logout
app.get('/logout', function(request, response) {
  if (request.loggedInUser) {
    redditAPI.deleteCookie(request.loggedInUser[0].token)
    .then(function(result) {
      response.clearCookie('SESSION')
      response.render('logout')
    })
    .catch(function(error) {
      response.send(`${error}`);
    })
  }
  else {
    response.render('logout', {title: 'Logout'});
  }
})

///////////////////////////////////////////////////////////////////////////////
// Create post
app.get('/createpost', function(request, response) {
  if (!request.loggedInUser) {
    response.render('notSignIn', {title: 'Not sign in'});
  }
  else {
    redditAPI.getAllSubreddit()
    .then(function(subs) {
      response.render('createPost', {subs: subs, title: 'Create post'});
    })
    .catch(function(error) {
      response.send(`${error.stack}`)
    })
  }
})

app.post('/createpost', function(request, response) {
  redditAPI.createPost({
    'userId': request.loggedInUser[0].userId,
    'title': request.body.title,
    'url': request.body.url,
    'subredditId': request.body.selectedSub
  })
  .then(function(result) {
    response.redirect('/frontpage/?sort=new');
  })
  .catch(function(error) {
    response.send(`${error.stack}`);
  })
})

///////////////////////////////////////////////////////////////////////////////
// Suggest title
app.get('/suggesttile', function(request, response) {
  // let userUrl = request.query.url
  core.requestPromise('http://www.decodemtl.com')
  .then(function(result) {
    var requestedPageTitle = (result.body).split('<title>')[1].split('</title>')[0];
    response.send(requestedPageTitle);

  })
  .catch(function(error) {
    response.send(`${error.stack}`);
  })
})

app.post('suggesttile', function(request, response) {
  console.log(requestedPageTitle);
})

///////////////////////////////////////////////////////////////////////////////
// Voting system
app.post('/vote', function(request, response) {
  if (!request.loggedInUser) {
    response.render('notSignIn', {title: 'Not sign in'});
  }
  else {
    redditAPI.createVote({
      'postId': request.body.postId,
      'userId': request.loggedInUser[0].userId,
      'vote': request.body.vote,
    })
    .then(function(result) {
      response.redirect('/frontpage');
    })
    .catch(function(error) {
      response.send(`${error.stack}`);
    })
  }
})

///////////////////////////////////////////////////////////////////////////////
// Check identifiants
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

///////////////////////////////////////////////////////////////////////////////
// Start web server
const server = app.listen((process.env.PORT), function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Web Server is listening at http://%s:%s', host, port);
});

// On browser
// http://127.0.0.1:3000/