angular-websocket
=================

A simple module for utilizing raw websockets in angular.


We all love Socket.io, but there are still servers out there that don't play nice with our 
beloved realtime call-stack (blasphemy!) thats where this library comes in, a simple call wrapper
for the browser WebSocket, this framework removes the need for the ugly syntax that is WebSockets
and replaces it with nicely behaved $promises.


Requires [underscore](http://underscorejs.org/).

Use:

```javascript

angular.module('myModule', ['ngWs'])
.controller('MyController', function($scope, $ws, $timeout) {

  $scope.aProperty = {a : 5, b : 'aValue'};

  //Use the factory
  $ws('ws://real-time.org:3000/go', {retries : 5, timeout : 5000})
    .bind($scope, 'aProperty') //Bind a property to be updated by new messages
    .onmessage(function(json) {/*Handle a json message */}) 
    .onbinary(function(binary) {/*Handle a binary message */}) 
    .onopen(function() {/*Listen for the socket to open*/})
    .connect(); //Connect a new instance.

  //Or define with your own logic
  var retries = 10;

  function reconnect() {
  
    //=> ws://real-time.org:3000/go
    $ws.connect('ws://real-time.org:3000/go', {}, [/*Any extensions to be supported*/])
        .then(function(ws) {
          //Returns a functioning websocket
          ws.onmessage = function(msg) {/*Do something with the incoming message*/};
        },
        function(e) {
        
          //The socket closed because of an exception
          if (e) {
            log.error(e.msg);
            
            retries -= 1;
            
            //Reconnect
            if (retries > 0)
              $timeout(reconnect, 3000);
          }
        
        });
  }

})

//Configure with your favorite websocket library
.configure(function($wsProvider) {
  $wsProvider.setFactory(/*Some other webSocket*/, {/*Remap the interface*/});

});

```
