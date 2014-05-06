var def = define || function(name, deps, method) {
	var angular = angular || null;
	return method(angular);
};

define('ngWebSocket', ['angular', 'underscore'], function(angular) {
  return angular.module('ngWs', []).factory('$ws', function($q, $timeout) {
	  
	  var webSocketFactory = function(url, params, ext) {
	  	
		  var webSocket = function() {
			  var resolved = false;
			  
			  var _model = null;
			  
			  var options = _.defaults(params, {timeout : 3000, retries : 10});
			  
			  var _listeners = {binary : [], str : [], json : [], open : []};
			  
			  var self = this;
			  
			  this._ws = null;
			  
			  this.connect = function() {
			  	
				if (!resolved)
					webSocketFactory.connect(url, ext)
				  		.then(function(ws) {
					  		self._ws = ws;
					  		self._ws.onmessage = _onmessage;
					  		_onopen(); 
					  	},
					  	function(e) {
				  			delete self._ws;
				  			self._ws = null;
				  			
				  			//If there was an exception then we did not close in an orderly manner
					  		if (e) {
					  			
					  			options.retries -= 1;
					  			
					  			if (options.retries > 0) {
					  				console.error('Error connecting, reattempting');
					  				$timeout(self.connect, options.timeout);
					  			}
					  		}
					  	}
					  	);
			  };
			  
			  this.onmessage = function(listener) {
				  _listeners.str.push(listener);
				  
				  return this;
			  };
			  
			  this.onjson = function(listener) {
				  _listeners.json.push(listener);
				  
				  return this;
			  };
			  
			  this.onbinary = function(listener) {
				  _listeners.binary.push(listener);
				  
				  return this;
			  };
				
			  this.onopen = function(listener) {
				  _listeners.open.push(listener);
				  
				  return this;
			  };
			  
			  this.bind = function(scope, property) {
				  _model = scope[property];
				  this.onjson(function(json){
					  scope.$apply(function() {
						  _.extend(_model, json);
					  });
				  });
				  
				  return this;
				  
			  };
			  
			  function _onmessage(msg) {
			  	if (typeof msg.data === 'string') {
			  		_listeners.str.forEach(function(listener){listener(msg.data);});
			  		
			  		if (_listeners.json.length > 0) {
			  			var json = JSON.parse(msg.data);
			  			_listeners.json.forEach(function(listener){listener(json);});
			  		}
			  	} else {
			  		_listeners.binary.forEach(function(listener){listener(msg.data);});
			  	}
			  };
			  
			  function _onopen() {
				  _listeners.open.forEach(function(listener){listener();});
			  };
		  };
		  
		  return new webSocket(params);
	  };
	  
	  webSocketFactory.connect = function(url, ext) {
	        var deferred = $q.defer();
	        
	        var url = url,
	            ext = ext || [];
	            
	            
	            var ws = new WebSocket(url, ext);
	            
	            ws.onopen = function() {
	              deferred.resolve(ws);
	            };
	            
	            ws.onerror = function(e) {
	              deferred.reject(e);
	            };
	            
	            ws.onclose = function(r) {
	              deferred.reject();
	            };
	            return deferred.promise;
	      };
    
    return webSocketFactory;
  });
});
