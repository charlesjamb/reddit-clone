var express = require('express');
var app = express();

app.get('/', function (req, res) {
	res.send('Hello World!');
});

app.get('/hello', function(req, res) {
	// console.log(req.query);

	res.send('Hello ' + req.query.name);
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