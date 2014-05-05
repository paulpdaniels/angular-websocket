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
			  
			  var timeout = 3000,
			  	  retries = 10;
			  
			  var _listeners = {binary : [], json : [], open : []};
			  
			  var self = this;
			  
			  this._ws = null;
			  
			  this.connect = function() {
				  
				  if (!resolved)
					  webSocketFactory.connect(url, params, ext)
					  	.then(function(ws) {
					  		self._ws = ws;
					  		self._ws.onmessage = _onmessage;
					  		_onopen(); 
					  	},
					  	function(e) {
				  			delete self._ws;
				  			self._ws = null;
				  			
					  		if (e) {
					  			
					  			retries -= 1;
					  			
					  			if (retries > 0) {
					  				console.error('Error connecting, reattempting');
					  				$timeout(self.connect, timeout);
					  			}
					  		}
					  	}
					  	);
			  };
			  
			  this.onmessage = function(listener) {
				  _listeners.json.push(_.compose(listener, JSON.parse));
				  
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
				  this.onmessage(function(json){
					  scope.$apply(function() {
						  _.extend(_model, json);
					  });
				  });
				  
				  return this;
				  
			  };
			  
			  function _onmessage(msg) {
				  var listeners = (typeof msg.data === 'string') ?
						  _listeners.json :
						  _listeners.binary;
				  listeners.forEach(function(listener){listener(msg.data);});
			  };
			  
			  function _onopen() {
				  _listeners.open.forEach(function(listener){listener();});
			  };
			  
			  function _reconnect() {
				  
			  }
		  };
		  
		  return new webSocket(url, params, ext);
	  };
	  
	  webSocketFactory.connect = function(url, params, ext) {
	        var deferred = $q.defer();
	        
	        var url = url,
	            params = params || {},
	            ext = ext || [],
	            
	            query = _.isEmpty(params) ? '' :
	                    ('?' + _.chain(params).pairs().map(function(pair){
	                    	return pair.join('=');
	                    }).value().join('&'));
	            
	            var ws = new WebSocket(url + query, ext);
	            
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
