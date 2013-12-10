var oauth2 = require('./oauth2');
var client = require('./client');
var account = require('./account');
var files = require('./files');

//Dictionary of all modules that handle requests
var modules = {
    'client' : client,
    'oauth2' : oauth2,
    'account': account,
    'files'  : files
}

//Routes request to the right handler
//Parameters:
//headers: request headers. {name : value}
//path: everything after host:port/ in URL
//params: URL parameters. {name : value}
//postData: Payload/body of POST request
//response: Message to send back to client
function route (headers, path, params, postData, response) {
    pathsplit = path.split('/');
    if (typeof modules[pathsplit[2]] == 'object') {
        if (typeof modules[pathsplit[2]].main == 'function') {
            var jumpto = modules[pathsplit[2]].main;
            jumpto(headers, path, params, postData, response);
        }
    } else {
        response.writeHead(404, {'content-Type' : 'application/json'});
        response.write('{error : "not found"}');
        response.end();
    }
}

exports.route = route;
