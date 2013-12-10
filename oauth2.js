var db = require('./db').mydb;
var myCrypto = require('./myCrypto');
var querystring = require('querystring');
var ObjectId = require('mongojs').ObjectId;

var methods = {
    'authorize' : function(headers, path, params, postData, response) {
        if (typeof params.response_type == 'undefined') {
            response.writeHead(400, {'content-Type' : 'application/json'});
            response.write('{error : "missing response_type"}');
            response.end();
        } else {
            //if user/pass are null, serve login page
            if (postData == null || /^[s]*$/.test(postData)) {
                myQuerystring = [];
                for (var param in params) {
                    myQuerystring.push(encodeURIComponent(param) + '=' + params[param]);
                }
                response.writeHead(302, {'location' : '/1/client/login.html?' + myQuerystring.join('&')});
                response.end();
            } else {
            //login page posts back here, with user/pass
            //verify user/pass
                var credentials = querystring.parse(postData); 
                db.users.find({user : credentials.user, pass : credentials.pass}, function (err, users) {
                    if (err || users.length <= 0) {
                        response.writeHead(200, {'content-Type' : 'application/json'});
                        response.write('{error : "incorrect User/Pass"}');
                        response.end();
                    } else {
                        //generate and store code
                        var sessName = '';
                        var code = '';
                        //client_id is optional friendly name given to session
                        if (typeof params.client_id !== 'undefined')
                            sessName = params.client_id;
                        //token flow
                        if (params.response_type == 'token') {
                            //redirect_uri is required for token
                            if (typeof params.redirect_uri == 'undefined') {
                                response.writeHead (400, {'content-Type' : 'application/json'});
                                response.write('{error : "missing redirect_uri"}');
                                response.end();
                            } else {
                                db.sessions.save( {uid : users[0]._id, sessionName : sessName}, function(err, sessionObj) {
                                    if (err || !sessionObj) {
                                        console.log('>> ERR! couldn\'t create session.');
                                        response.writeHead(500, {'content-Type' : 'application/json'});
                                        response.write('{error : "internal server error"}');
                                        response.end();
                                    } else {
                                        code = myCrypto.encrypt(JSON.stringify(sessionObj._id));
                                        responseQuery = '#access_token=' + encodeURIComponent(code) + '&token_type=bearer&uid=' + users[0]._id;
                                        if (typeof params.state !== 'undefined')
                                            responseQuery += '&state=' + params.state;
                                        response.writeHead(302, {'location' : params.redirect_uri + responseQuery});
                                        response.end();
                                    }
                                });
                            }
                        //code flow
                        } else if (params.response_type == 'code') {
                        db.codes.save( {uid : users[0]._id, sessionName : sessName}, function (err, codeObj) {
                                if (err || !codeObj)
                                    console.log('>> ERR! couldn\'t create partial session.');
                                else {
                                    code = myCrypto.encrypt(JSON.stringify(codeObj._id));
                                    //redirect_uri is optional
                                    if (typeof params.redirect_uri == 'undefined') {
                                        response.writeHead(200, {'content-Type' : 'application/json'});
                                        response.write('{code : ' + code  + '}');
                                        response.end();
                                    } else {
                                        responseQuery = '#code=' + encodeURIComponent(code);
                                        if (typeof params.state !== 'undefined')
                                            responseQuery += '&state=' + params.state;
                                        response.writeHead(302, {'location' : params.redirect_uri + responseQuery});
                                        response.end();
                                    }
                                    //set code to expire after 5 min
                                    setTimeout (function () {db.codes.remove(codeObj);}, 300000);
                                }
                            });
                        } else {
                            response.writeHead(400, {'content-Type' : 'application/json'});
                            response.write('{error : "invalid response_type. Expected: token | code"}');
                            response.end();
                        }
                    }
                });
            }
        }
    },
    'token' : function(headers, path, params, postData, response) {
        var postParams = querystring.parse(postData);
        if (typeof postParams.code == 'undefined') {
            response.writeHead(400, {'content-Type' : 'application/json'});
            response.write('{error : "missing code"}');
            response.end();
        } else {
            var codeObj = JSON.parse(myCrypto.decrypt(postParams.code));
            var tokencode = '';
            db.codes.find({ '_id' : ObjectId(codeObj) }, function(err, oldCodeObj) {
                if (err || oldCodeObj.length <= 0) {
                    response.writeHead(401, {'content-Type' : 'application/json'});
                    response.write('{"error_description" : "given code is not valid", "error" : "invalid_grant"}');
                    response.end();
                }else{
                    //create session
                    db.sessions.save({uid : oldCodeObj[0].uid, sessionName : oldCodeObj[0].sessionName}, function(err, sessObj) {
                        if (err || !sessObj) {
                            console.log('>> ERR! Couldn\'t create session.');
                            response.writeHead(500, {'content-Type' : 'application/json'});
                            response.write('{error : "internal server error"}');
                            response.end();
                        } else {
                            //delete code
                            db.codes.remove(oldCodeObj[0]);
                            tokencode = myCrypto.encrypt(JSON.stringify(sessObj._id));
                            //send response
                            response.writeHead(200, {'content-Type' : 'application/json'});
                            response.write('{"access_token" : ' + tokencode + ', "token_type" : "bearer", "uid" : ' + sessObj.uid + '}');
                            response.end();
                        }
                    })
                }
            });
        }
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
