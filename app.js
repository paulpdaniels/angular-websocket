/**
 * Created by Paul on 5/8/2014.
 */
var express = require('express')
    ,http    = require('http')
    ,path = require('path')
    , WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port : 3001})
    ,app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.favicon());

    app.use(express.bodyParser());

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('/',  function(req, res) {
        res.render('index', {title : 'Hello'});
    });

});

app.configure('development', function(){
    app.use(express.logger('tiny'));
    app.use(express.errorHandler());
});

var server = http.createServer(app);



server.listen(app.get('port'), function(){
    console.log('Express server listener on port ' + app.get('port'));
});

wss.on('connection', function(socket) {
    setTimeout( function() {
    socket.send(JSON.stringify({name : 'Not as good'}));
    socket.send('I am good');
        }, 3000);
});

