const request = require('request');
const prompt = require('prompt');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const HASH_ROUNDS = 10;

///////////////////////////////////////////////////////////////////////////////
// Bcrypt - generate hash passwords
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

function hashCompare(plainText, hash) {
	return new Promise(function(resolve, reject) {
		bcrypt.compare(plainText, hash, function(err, result) {
			if (err) {
				reject(err);
			}
			else {
				resolve(result);
			}
		})
	});
}

///////////////////////////////////////////////////////////////////////////////
// Query to the database
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

function stringifyQuery(query) {
	return (
		connectionQuery(query)
		.then(function(result) {
			var actualQuery = JSON.stringify(result, null, 4);
			return actualQuery;
		})
	);
}

///////////////////////////////////////////////////////////////////////////////
// Request promise
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

function stringifyRequest(url) {
	return ( 
		requestPromise(url)
		.then(function(result) {
			var actualResult = JSON.parse(result.body);
			return actualResult;
		})
	);	
}

///////////////////////////////////////////////////////////////////////////////
// Prompt promise
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

///////////////////////////////////////////////////////////////////////////////
// Exports
exports.crypt = crypt;
exports.hashCompare = hashCompare;
exports.makeConnQuery = makeConnQuery;
exports.requestPromise = requestPromise;
exports.promptPromise = promptPromise;
exports.requestJSON = stringifyRequest;
exports.niceQuery = stringifyQuery; 