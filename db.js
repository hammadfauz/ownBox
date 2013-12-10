var mongojs = require('mongojs');
var databaseUrl = 'ownBoxDB';
var gridfs = require('GridFS').GridFS;
var collections = ['users',    //registered users
                   'codes',    //partially open sessions
                   'sessions'  //established sessions
                   ];
var fileCollections = ['rootfs'];
function getLatestRevision(fileName) {
    var filesdb = mongojs.connect(databaseUrl, fileCollections);
    filesdb.rootfs.files.find({filename : fileName, "metadata.nextRev" : null}, function(err, file) {
        if (err || file.length <= 0) {
            return -1;
        } else {
            return file[0]._id;
        }
    });
}
function getRevisionNumber(revNo, fileName) {
    var filesdb = mongojs.connect(databaseUrl, fileCollections);
    filesdb.rootfs.files.find({filename : fileName, "metadata.lastRev" : null}, function(err, file) {
        
    });
}
exports.mydb = mongojs.connect(databaseUrl, collections);
exports.rootfs =  new GridFS(databaseUrl, 'rootfs');
