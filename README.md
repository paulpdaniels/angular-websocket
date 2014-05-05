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
.controller('MyController', function($ws, $timeout) {

  var retries = 10;

  function reconnect() {
  
    //=> ws://real-time.org:3000/go?id=14
    $ws.connect('ws://real-time.org:3000/go', {id : 14}, [/*Any extensions to be supported*/])
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

});

```
