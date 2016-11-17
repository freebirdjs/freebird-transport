// Goal: We'd like to use any transportation for freebird client/server communication
// msg is a string or a buffer

var util = require('util'),
    EventEmitter = require('events');

function Transport() {
    EventEmitter.call(this);

    this._send = function (msg, callback) {                 // msg: { id: x, data: x }
        throw new Error('Template method _send should be provided by implementor');
    };
}

util.inherits(Transport, EventEmitter);

Transport.prototype.send = function (msg, callback) {       // msg: { id: x, data: x }
    if (typeof msg !== 'object')
        return setImmediate(callback, new TypeError('msg must be an object with a data property'));
    else
        return this._send(msg, callback);
};

Transport.prototype.receive = function (msg, callback) {    // msg: { id: x, data: x }
    var self = this;

    if (typeof msg !== 'object')
        return setImmediate(callback, new TypeError('msg must be an object with a data property'));

    setImmediate(function () {
        if (typeof callback === 'function')
            callback();

        self.emit('message', msg);
    });
};

Transport.prototype.unhandled = function (msg, callback) {
    var self = this;

    if (typeof msg !== 'object')
        return setImmediate(callback, new TypeError('msg must be an object with a data property'));

    setImmediate(function () {
        if (typeof callback === 'function')
            callback();

        self.emit('unhandledMessage', msg);
    });
};

module.exports = Transport;
