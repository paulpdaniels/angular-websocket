var def = define || function(name, deps, method) {
  return method(angular);  
};

define('ngWebSocket', ['angular', 'underscore'], function(angular) {
  return angular.module('ngWs', []).factory('$ws', function($q) {
    
    return {
      connect : function(url, params, ext) {
        var deferred = $q.defer();
        
        var url = url,
            params = params || {},
            ext = ext || [],
            
            query = _.isEmpty(params) ? '' :
                    ('?' + _.chain(params).pairs().map(function(pair){
                    
                    
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
      }
    
    };
  });
});
