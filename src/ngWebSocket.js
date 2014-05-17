'use strict';

(function (root) {

    var _ = root._,
        Rx = root.Rx,
        define = root.define,
        angular = root.angular;


    angular.module('ngWs', []).provider('$ws', function () {

        var Factory = WebSocket;

        this.setWebSocketFactory = function (factory) {
            Factory = factory;
        };

        this.$get = function ($q, $timeout) {
            var webSocketFactory = function (url, params, ext) {

                var Socket = function () {

                    function getData(msg) {
                        return msg.data;
                    }

                    function isString(msg) {
                        return typeof msg === 'string';
                    }

                    function getJsonData(msg) {
                        try {
                            return JSON.parse(msg);
                        } catch (e) {
                            return null;
                        }
                    }

                    function isBlob(msg) {
                        return typeof msg !== 'string';
                    }

                    this.resolved = false;

                    //Everything should come through the raw event
                    var raw = new Rx.Subject(),

                    //Surface the data that we get from msg through this observable
                        data = raw.map(getData),

                    //Next we surface string messages through the message subscriber
                        message = data.where(isString),

                    //Now we should also keep track of binary messages
                        binary = data.where(isBlob),

                    //Messages that can be parsed as json are finally processed
                        json = message.map(getJsonData).where(function (data) {
                            return data !== null;
                        }),


                    //Track the message
                        open = new Rx.Subject(),

                        close = new Rx.Subject();

                    var handlers = {
                        raw : raw,
                        message : message,
                        json : json,
                        open : open,
                        close: close,
                        binary : binary
                    };

                    var options = _.defaults(params || {}, {timeout: 3000, retries: 10});

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
                                    open.onNext();

                                    self._ws.onclose = function () {
                                        close.onNext();
                                    };
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

                        return self;
                    };

                    this.on = function (name, handler) {

                        if (handlers[name]) {
                            handlers[name].subscribe(handler);
                        }

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


                var ws = new Factory(url, ext);

                ws.onopen = function () {
                    deferred.resolve(ws);
                };

                ws.onerror = function (e) {
                    deferred.reject(e);
                };

                ws.onclose = function () {
                    deferred.reject();
                };
                return deferred.promise;
            };

            return webSocketFactory;
        };
    });

    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

        require(function() {
            return angular;
        });
    } else {
        // in a browser or Rhino
        root.angular = angular;
    }

})(window, null);