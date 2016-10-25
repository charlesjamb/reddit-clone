const request = require('request');
const prompt = require('prompt');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const HASH_ROUNDS = 10;

// hash a password with bcrypt
function crypt(password, HASH_ROUNDS) {
	return new Promise(function(resolve, reject) {
		bcrypt.hash(password, HASH_ROUNDS, function(err, hashedPassword) {
			if (err) {
				reject(err);
			}
			else {
				resolve(hashedPassword);
			}
		})
	});
}

// query to the database
function makeConnQuery(connection) {
	return function connQuery(thequery, params) {
		return new Promise(function(resolve, reject) {
			connection.query(thequery, params, function(err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			})
		});
	}	
}


// stringify the sql query
function niceQuery(query) {
	return (
		connectionQuery(query)
		.then(function(result) {
			var actualQuery = JSON.stringify(result, null, 4);
			return actualQuery;
		})
	);
}

// request promise
function requestPromise(url) {
	return new Promise(function(resolve, reject) {
		request(url, function(err, result) {
			if (err) {
				reject(err);
			}
			else {
				resolve(result);
			}
		})
	});
}

// prompt promise
function promptPromise(question) {
	return new Promise(function(resolve, reject) {
		prompt.get(question, function(err, answer) {
			if (err) {
				reject(err);
			}
			else {
				resolve(answer);
			}
		})
	});
}

// request as JSON
function requestJSON(url) {
	return ( 
		requestPromise(url)
		.then(function(result) {
			var actualResult = JSON.parse(result.body);
			return actualResult;
		})
	);	
}

exports.crypt = crypt;
exports.makeConnQuery = makeConnQuery;
exports.requestPromise = requestPromise;
exports.promptPromise = promptPromise;
exports.requestJSON = requestJSON;
exports.niceQuery = niceQuery; 