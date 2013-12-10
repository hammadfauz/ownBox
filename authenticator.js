var db = require("./db").mydb;
var myCrypto = require('./myCrypto');
var ObjectId = require('mongojs').ObjectId;

function check (headers, response, successCallback) {
    if (typeof headers.authorization == 'string') {
        var encToken = headers.authorization.split(' ')[1];
        var decToken = /[0-9a-fA-F]{24}/g.exec(myCrypto.decrypt(encToken))[0];
        db.sessions.find({_id : ObjectId(decToken)}, function (err, session) {
            if (!err && (session.length > 0)) {
                successCallback(session[0]);
            } else {
                response.writeHead(401, {'content-Type' : 'application/json'});
                response.write('{error : "not found"}');
                response.end();
            }
        });
    } else {
        response.writeHead(400, {'content-Type' : 'application/json'});
        response.write('{error : "missing credentials"}');
        response.end();
    }
}

exports.check = check;
