var express = require('express');
var app = express();

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqltemppassword',
  database : 'reddit'
});

var reddit = require('./reddit.js');
var redditAPI = reddit(connection);

app.get('/', function (req, res) {
	res.send('Hello World!');
});

app.get('/hello', function(req, res) {
	// console.log(req.query);

	res.send('Hello ' + req.query.name);
});

app.get('/hello/:name', function(req, res) {
	res.send('Hello ' + req.params.name);
});

app.get('/calculator/:operation', function(req, res) {
	var theCalculator = {
		'operator': req.params.operation,
		'firstOperand': parseInt(req.query.num1),
		'secondOperand': parseInt(req.query.num2)
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
		res.sendStatus(400);	
	}
	res.send(JSON.stringify(theCalculator, null, 4));
});

app.get('/posts/', function(req, res) {

	redditAPI.getAllPosts('new', {'numPerPage': 5, 'page': 0})
		.then(function(result) {

			var HTML = `<div id="contents">
  						<h1>List of contents</h1>
  						<ul class="contents-list">`;
  			result.forEach(function(post) {
  				HTML += `<li class="content-item">
						<h2 class="content-item__title">
							<a href=${post.PostURL}>${post.PostTitle}</a>
						</h2>
							<p>Created by ${post.User.Username}</p>
							</li>` 
  			})

  			res.send(HTML);
		})
		.catch(function(err) {
			console.log(err)
		})

});


/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen((process.env.PORT || 3000), (process.env.IP || '127.0.0.1'), function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

// On browser
// http://127.0.0.1:3000/