var fs = require('fs');

var clientDir = './client/';
ext2mimeMap = {
    '.htm' : 'text/html' ,
    '.html' : 'text/html' ,
    '.js' : 'application/javascript' ,
    '.css' : 'text/css' ,
    '.ico' : 'image/x-icon'
};

function main (headers, path, params, postData, response) {
    urlPath = path.split('?')[0];
    fileDir = urlPath.split('/').slice(3).join('/');
    filePath = fileDir;
    extension = /(?:\.([^.]+))?$/.exec(filePath)[0];
    console.log('----------------------');
    console.log(clientDir + filePath);
    console.log('----------------------');
    fs.readFile(clientDir + filePath, 'utf8', function (err, file) {
        if (err) {
            if(err.code == 'ENOENT') {
                response.writeHead(404, {'content-Type' : 'text/plain'});
                response.write('404. Not Found!')
                response.end();
            } else if (err.code == 'EISDIR') {
                response.writeHead(403, {'content-Type' : 'text/plain'});
                response.write('403. Access Denied!');
                response.end();
            } else {
                response.writeHead(500, {'content-Type' : 'text/plain'});
                response.write('500. Server Error.');
                response.end();
            }
        } else {
            response.writeHead(200, {'content-Type' : ext2mimeMap[extension]});
            response.write(file);
            response.end();
        }
    })
}

exports.main = main;
