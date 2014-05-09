'use strict';

;
(function (root, angular) {

    var Emitter = root.Emitter;


    var ngWebSocket = angular.module('ngWs', []).provider('$ws', function () {

        var _factory = WebSocket;

        this.setWebSocketFactory = function (factory) {
            _factory = factory;
        };

        this.$get = function ($q, $timeout) {
            var webSocketFactory = function (url, params, ext) {

                var actionableEvents = [
                    'json',
                    'message',
                    'raw',
                    'binary',
                    'open',
                    'close',
                    'error'
                ];

                var Socket = function () {



                    function getData(msg) {
                        return msg.data;
                    };

                    function isString(msg) {
                        return typeof msg.data === 'string';
                    };

                    this.resolved = false;

                    var raw = new Rx.Subject(),
                        message = raw.where(isString).map(getData),
                        json = message.map(function(data) {
                            try {return JSON.parse(data);} catch(e) { return null; }
                        })
                        .where(function(data) { return data != null;}),
                        binary = raw.where(function(msg) {
                            return typeof msg.data !== 'string'
                        })
                        .map(function(msg) {
                                return msg.data;
                        });

                    var open = new Rx.Subject();

                    var handlers = {
                        raw : raw,
                        message : message,
                        json : json,
                        open : open,
                        binary : binary
                    };

                    var self = this;

                    var _model = null;

                    var options = _.defaults(params || {}, {timeout: 3000, retries: 10});

                    var self = this;

                    this._ws = null;

                    this.connect = function () {

                        var self = this;

                        if (!this.resolved) {
                            webSocketFactory.connect(url, ext)
                                .then(function (ws) {
                                    self._ws = ws;
                                    self._ws.onmessage = function(msg) {
                                        raw.onNext(msg);
                                    };
                                    open.onCompleted();
                                },
                                function (e) {
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
                        }
                    };

                    this.on = function (name, handler) {
                        if (handlers[name])
                            handlers[name].subscribe(handler);

                        return this;
                    };
                };

                Socket.prototype.bind = function (scope, property) {
                    this.on('json', function (json) {
                        scope.$apply(function () {
                            _.extend(scope[property], json);
                        });
                    });

                    return this;

                };



                return new Socket(params);
            };

            webSocketFactory.connect = function (url, ext) {
                var deferred = $q.defer();

                ext = ext || [];


                var ws = new _factory(url, ext);

                ws.onopen = function () {
                    deferred.resolve(ws);
                };

                ws.onerror = function (e) {
                    deferred.reject(e);
                };

                ws.onclose = function (r) {
                    deferred.reject();
                };
                return deferred.promise;
            };

            return webSocketFactory;
        };
    });

    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {

        require(function() {
            return angular;
        });
    } else {
        // in a browser or Rhino
        root.angular = angular;
    }

})(window, angular);