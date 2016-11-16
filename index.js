// Goal: We'd like to use any transportation for freebird client/server communication
// msg is a string or a buffer

var util = require('util'),
    EventEmitter = require('events');

function Transport() {
    EventEmitter.call(this);

    this._send = function (msg, callback) {
        throw new Error('Template method _send should be provided by implementor');
    };
}

util.inherits(Transport, EventEmitter);

Transport.prototype.send = function (msg, callback) {
    return this._send(msg, callback);
};

Transport.prototype.receive = function (msg, callback) {
    var self = this;

    setImmediate(function () {
        self.emit('message', msg);
        if (callback)
            callback();
    });
};

module.exports = Transport;
