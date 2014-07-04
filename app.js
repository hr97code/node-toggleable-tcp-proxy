var net = require('net');

// hardcoded, do with these what you with
var proxyHost = "192.168.1.50";
var proxyPort = 22;
var proxyListenPort = 2222;
var httpListenPort = 3000;

var started = false;

var server = net.createServer(function (socket) {
    var proxySocket = net.createConnection(proxyPort, proxyHost, function() {
        socket.pipe(proxySocket).pipe(socket);
        });

        socket.on('end', function() {
        proxySocket.end();
        });

        proxySocket.on('end', function() {
        socket.end();
        });

        socket.on('error', function(err) {
        proxySocket.end();
        });

        proxySocket.on('error', function(err) {
        socket.end();
    });
});

server.on('close', function() {
    console.log('Proxy server disconnected');
    started = false;
});

var express = require('express');
var app = express();
var path = require('path');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var stopProxy = function() {
    if (started) {
        console.log("Stopping proxy server");
        server.close();
    }
};

var startProxy = function() {
    if (!started) {
        server.listen(proxyListenPort, function() {
            console.log("TCP server accepting connection on port: %d", proxyListenPort);
            started = true;
        });
    }
};

app.get('/', function(req, res) {
    res.render('index', { started: started });
});

app.put('/start', function(req, res) {
    startProxy();
    res.send("ok");
});

app.put('/stop', function(req, res) {
    stopProxy();
    res.send("ok");
});

var httpServer = app.listen(httpListenPort, function() {
    console.log('Listening on port %d', httpServer.address().port);
});