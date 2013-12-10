var db = require('./db').mydb;
var authenticator = require('./authenticator');

var methods = {
    'info' : function(headers, path, params, postData, response) {
        authenticator.check(headers, response, function(session) {
            db.users.find({_id : session.uid}, function (err, users) {
                if (err || users.length <= 0) {
                    response.writeHead(500, {'content-Type' :  'application/json'});
                    response.write('{error : "server error"}');
                    response.end();
                } else {
                    response.writeHead(200, {'content-Type' : 'application/json'});
                    response.write('{"display_name" : "' + users[0].display_name + 
                        '", "uid" : "' + users[0]._id + '"}');
                    response.end();
                }
            });
        });
    }
};
function main (headers, path, params, postData, response) {
    pathsplit = path.split('/');
    if (typeof methods[pathsplit[3]] == 'function') {
        methods[pathsplit[3]](headers, path, params, postData, response);
    } else {
        response.writeHead(404, {'content-Type' : 'application/json'});
        response.write('{error : "not found"}');
        response.end();
    }
}

exports.main = main;
