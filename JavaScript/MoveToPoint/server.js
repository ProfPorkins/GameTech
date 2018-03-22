/* eslint-env node */
/* eslint no-mixed-requires: ["error", { "grouping": false }] */
/* eslint one-var: 0 */
'use strict';

var http = require('http'),
	path = require('path'),
	fs = require('fs');

var mimeTypes = {
	'.js' : 'text/javascript',
	'.html' : 'text/html',
	'.css' : 'text/css',
	'.png' : 'image/png',
	'.jpg' : 'image/jpeg',
	'.mp3' : 'audio/mpeg3'
};

//------------------------------------------------------------------
//
// Super, duper simple http server.  Servers the purpose needed for the
// demos I'm writing and no more.
//
//------------------------------------------------------------------
function handleRequest(request, response) {
	var lookup = (request.url === '/') ? '/index.html' : decodeURI(request.url),
		file = lookup.substring(1, lookup.length);

	console.log('request: ' + request.url);
	fs.exists(file, function(exists) {
		if (exists) {
			console.log('Trying to send: ' + lookup);
			fs.readFile(file, function(err, data) {
				var headers = { 'Content-type': mimeTypes[path.extname(lookup)] };

				if (err) {
					response.writeHead(500);
					response.end('Server Error!');
				} else {
					response.writeHead(200, headers);
					response.end(data);
				}
			});
		} else {
			console.log('Failed to find/send: ' + lookup);
			response.writeHead(404);
			response.end();
		}
	});
}

http.createServer(handleRequest).listen(3000, function() {
	console.log('Server is listening on port 3000');
});
