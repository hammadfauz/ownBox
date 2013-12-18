var fs = require('fs');
var db = require('./db').mydb;
var storageDir = './storage';
//**var ObjectId = require('mongojs').ObjectId;
//storage /uid/rootname/path/to/file/fileId.rev
//flat table in db stores metadata

function getFilePath (uid, rootname, reqPath, rev, callBack) {
    var filePath = storageDir + '/' + uid + '/' + rootname + '/';
    db.metadata.find({path : reqPath, owner : uid}, function (err, metadatas) {
        if (err || metadatas.length <=0) {
            callBack (err, null);
        } else {
            var myMetadata = metadatas[0];
            var reqPathSplit = reqPath.split('/');
            var len = reqPathSplit.length;
            reqPathSplit[len - 1] = myMetadata._id;
            var outpath = reqPathSplit.join('/');
            filePath = filePath + outpath + '.' +  rev;
            callBack(null, filePath);
        }
    });
}
