 var db = require('./db').mydb;
 var authenticator = require('./authenticator');

 var methods = {
     'GET' : function(headers, path, params, postData, response) {
        authenticator.check(headers, response, function(session) {
            db.rootfs.get(path, function(err, fileContent) {
               
                if (err) {
                    response.writeHead(404, {'content-Type' : 'application/json'});
                    response.write('{error : "'+ err +'"}');
                    response.end();
                } else {
                    response.writeHead(200, {'content-Type' : /*TODO: query content type*/});
                    response.write(fileContent);
                    response.end();
                }
            });
        });
     },
     'POST' : function(headers, path, params, postData, response) {
        authenticator.check(headers, response, function(session) {
                
        });
     }
 };

function main (headers, path, params, postData, response) {
    pathsplit = path.split('/');
    if (pathsplit.length > 4) {
        if (postData == null || /^[s]*$/.test(postData)) {
            methods.GET(headers, path, params, postData, response);
        } else {
            methods.POST(headers, path, params, postData, response);
        }
    } else {
        response.writeHead(404, {'content-Type' : 'application/json'});
        response.write('{error : "not found"}');
        response.end();
    }
}

exports.main = main;
