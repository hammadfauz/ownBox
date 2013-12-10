var crypto = require('crypto');
var fs = require('fs');
var http = require('https');
var url = require("url");

//private key and certificate for generating SSL credentials
var privateKey = fs.readFileSync('server.key').toString();
var certificate = fs.readFileSync('server.crt').toString();
var credentials = {key : privateKey, cert : certificate};

function start(route) {
	function onRequest (request, response) {
		var postData = "";
		request.setEncoding("utf8");
		request.addListener("data", function(postDataChunk) {
            //TODO: put in check for max POST size
			postData += postDataChunk;
		});
		request.addListener("end", function() {
            var parsedUrl = url.parse(request.url, true );
            //extract headers
            var headers = request.headers;
            //extract path
            var path = parsedUrl.pathname;
            //extract url parameters
            var params = parsedUrl.query;
		    route (headers, path, params, postData, response);
		});
	}
	var server = http.createServer(credentials, onRequest).listen(8443);
}
exports.start = start;
