var express = require('express');
var reddit = require('./reddit.js');
var bodyParser = require('body-parser')
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqltemppassword',
  database : 'reddit'
});

var app = express();
var redditAPI = reddit(connection);

app.set('view engine', 'pug');

app.get('/', function (req, res) {
	res.send('<h1>Hello World!</h1>');
});

app.get('/hello', function(req, res) {
	res.send(`<h1>Hello ${req.query.name || 'World'}!</h1>`);
});

app.get('/hello/:name', function(req, res) {
	res.send(`<h1>Hello ${req.params.name}!</h1>`);
});

app.get('/calculator/:operation', function(req, res) {
	var theCalculator = {
		'operator': req.params.operation,
		'firstOperand': Number(req.query.num1),
		'secondOperand': Number(req.query.num2)
	};
	switch(theCalculator.operator) {
		case 'add':
			theCalculator.solution = theCalculator.firstOperand + theCalculator.secondOperand;
			break;
		case 'sub':
			theCalculator.solution = theCalculator.firstOperand - theCalculator.secondOperand;
			break;
		case 'mult':
			theCalculator.solution = theCalculator.firstOperand * theCalculator.secondOperand;
			break;
		case 'div':
			theCalculator.solution = theCalculator.firstOperand / theCalculator.secondOperand;
			break;
		default:
		res.status(400).send('Please use a valid operator, add or sub or mult or div.');	
	}
	res.send(theCalculator);
});

app.get('/posts', function(req, res) {
	redditAPI.getAllPosts('new', {numPerPage: 5, page: 0})
	.then(function(posts) {
		res.render('post-list', {posts: posts});
	})
	.catch(function(err) {
		res.status(500).send(`${err}`);
	})
});

app.get('/createContent', function(req, res) {
	res.render('create-content')
});

app.use(bodyParser.urlencoded());

app.post('/createContent', function(req, res) {
	redditAPI.createPost({'userId': 1, 'title': req.body.title, 'url': req.body.url, 'subredditId': 1 })
	.then(function(result) {
		res.redirect('/posts');
	})
	.catch(function(err) {
		res.status(500).send(`${err}`);
	})
})


/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen((process.env.PORT || 3000), (process.env.IP || '127.0.0.1'), function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

// On browser
// http://127.0.0.1:3000/