angular-websocket
=================

A simple module for utilizing raw websockets in angular


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
