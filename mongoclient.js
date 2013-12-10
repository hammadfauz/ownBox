var databaseUrl = 'ownBoxDB';
var collections = ['users',    //registered users
                   'codes',    //partially open sessions
                   'sessions'  //established sessions
                   ];
var mydb = require('mongojs').connect(databaseUrl, collections);

mydb.sessions.find(function (err, users) {
    if (err || users.length <= 0) {
        console.log('no such user' + err);
    } else {
        console.log(users);
    }
})
