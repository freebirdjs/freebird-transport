# freebird-transport
The transport for freebird REQ/RSP/IND message transmission  

[![NPM](https://nodei.co/npm/freebird-transport.png?downloads=true)](https://nodei.co/npm/freebird-transport/)  

[![Travis branch](https://img.shields.io/travis/freebirdjs/freebird-transport/master.svg?maxAge=2592000)](https://travis-ci.org/freebirdjs/freebird-transport)
[![npm](https://img.shields.io/npm/v/freebird-transport.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-transport)
[![PyPI](https://img.shields.io/pypi/status/Django.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-transport)
[![npm](https://img.shields.io/npm/l/freebird-transport.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-transport)

## Table of Contents

1. [Overview](#Overview)  
2. [APIs and Events](#APIs)  
3. [TCP Server/Client Example](#Example)  

<a name="Overview"></a>
## 1. Overview

This module is the abstract class for developers to create their own transportation to communicate with freebird framework. This class inherits from EventEmitter which will emit a `'message'` event when a message arrives.  

* In this document, `transp` will be used to denote the instance of this class.  
* In the following methods, the argument `msg` must be an object in the shape of `{ clientId, data }`, where the `data` property is mandatory and should be a string or a buffer, and the `clientId` property is optional and should be a string or a number if given. One can attach an identifier, like a client id, to `msg.clientId` for message multiplexing.  

### For implementers:  

To have a valid `transp`, two things must be done by the implementer.  

1. Must implement the `transp._send(msg, callback)` method on the transport instance.  
2. Must call the `transp.receive(msg)` method to let the transport instance know that there a message comes in. Calling `transp.receive(msg)` will induce a `'message'` event triggered on the transport instance.  

### For users:  

To use the transport object:  

1. Call `transp.send(msg, callback)` to send message out. It wil throw if `_send()` was not provided by the implementer.  
2. Listen to `'message'` event to receive messages.  


<a name="APIs"></a>
## 2. APIs and Events  
  
* Constructor
    - [new Transport()](#API_Transport)
* Implementer provides
    - [_send()](#API__send)
    - [_broadcast()](#API__broadcast)
* Implementer calls
    - [receive()](#API_receive)
* User calls
    - [send()](#API_send)
    - [broadcast()](#API_broadcast)
* User listens to events
    - ['message'](#EVT_message), ['unhandledMessage'](#EVT_unhandledMessage)

*************************************************
<a name="API_Transport"></a>
### new Transport()
Create the transport instance.  

**Arguments:**  

1. none
  
**Returns:**  
  
* (_Object_): `transp`, instance of this class

**Examples:**  
    
```js
var Transport = require('freebird-transport');
var transp = new Transport();
```

*************************************************
<a name="API__send"></a>
### ._send(msg, callback)
The implmentation of sending out the message.  

**Arguments:**  

1. `msg` (_Object_): The message to trasmit out is a string or a buffer attached to `data` property of this object.  
2. `callback` (_Function_): `function (err, bytes) { ... }`. This err-first callback should be called after message sent off. The argument `bytes` tells how many bytes were sent.  
  
**Returns:**  
  
* none

**Examples:**  
    
```js
var transp = new Transport();

transp._send = function (msg, callback) {
    var bytes;

    if (typeof msg.data === 'string')
        msg.data = new Buffer(msg.data);

    if (!Buffer.isBuffer(msg.data))
        return setImmediate(callback, new TypeError('msg.data should be a string or a buffer'));

    bytes = msg.data.length;

    // ... implemention of message sending

    // Finally, call callback
    callback(null, bytes);
};
```

*************************************************
<a name="API__broadcast"></a>
### ._broadcast(msg, callback)
The implmentation of broadcasting the message. This is optional, it will use `transp.send(msg, callback)` internally by default if implementation is not given. This broadcasting method is used to send an indication to multiple remote clients.  

**Arguments:**  

1. `msg` (_Object_): The message to broadcast out is a string or a buffer attached to `data` property of this object.  
2. `callback` (_Function_): `function (err, bytes) { ... }`. This err-first callback should be called after message sent off. The argument `bytes` tells how many bytes were sent.  
  
**Returns:**  
  
* none

**Examples:**  
    
```js
var transp = new Transport();

transp._broadcast = function (msg, callback) {
    var bytes;

    if (typeof msg.data === 'string')
        msg.data = new Buffer(msg.data);

    if (!Buffer.isBuffer(msg.data))
        return setImmediate(callback, new TypeError('msg.data should be a string or a buffer'));

    bytes = msg.data.length;

    // ... implemention of message broadcasting

    // Finally, call callback
    callback(null, bytes);
};
```

*************************************************
<a name="API_send"></a>
### .send(msg, callback)
Call this method to send the message off.  

**Arguments:**  

1. `msg` (_Object_): The message to trasmit out must be a string or a buffer which should be attached to `data` property of this object.  
2. `callback` (_Function_): `function (err, bytes) { ... }`. Get called after message sent off. The argument `bytes` tells how many bytes were sent.  
  
**Returns:**  
  
* none

**Examples:**  
    
```js
var transp = new Transport();

// assume transp._send was implemented

// call transp.send() to send message
transp.send({ data: 'Hello World' }, function (err, bytes) {
    if (err)
        console.log(err);
    else
        console.log(bytes + ' bytes were sent')
});
```

*************************************************
<a name="API_broadcast"></a>
### .broadcast(msg, callback)
Call this method to broadcast the message.  

**Arguments:**  

1. `msg` (_Object_): The message to trasmit out must be a string or a buffer which should be attached to `data` property of this object.  
2. `callback` (_Function_): `function (err, bytes) { ... }`. Get called after message sent off. The argument `bytes` tells how many bytes were sent.  
  
**Returns:**  
  
* none

**Examples:**  
    
```js
var transp = new Transport();

transp.broadcast({ data: 'Hello World' }, function (err, bytes) {
    if (err)
        console.log(err);
    else
        console.log(bytes + ' bytes were sent')
});
```

*************************************************
<a name="API_receive"></a>
### .receive(msg[, callback])
The Implemntor should call this method to inform the message arrival.  

**Arguments:**  

1. `msg` (_Object_): This must be an object with a `data` property that holds the received message.  
2. `callback` (_Function_): `function (err) { ... }`. Optional. Get called after message sent off.
  
**Returns:**  
  
* none

**Examples:**  
    
```js
var transp = new Transport();

// Implemntor calls transp.receive() when message arrives
foo.on('data', function (data) {
    transp.receive({ data: data });
});
```

*************************************************
<a name="EVT_message"></a>
### .on('message', function (msg) {})
The user can listen to the `'message'` event to receive the message.  

**Arguments of the listener**  

1. `msg` (_Object_): This must be an object with a `data` property that holds the received message of a string or a buffer.  
  
**Examples:**  
    
```js
var transp = new Transport();

transp.on('message', function (msg) {
    console.log(msg.data.toString());
});
```

*************************************************
<a name="EVT_unhandledMessage"></a>
### .on('unhandledMessage', function (msg) {})
The implementer can listen to the `'unhandledMessage'` event to receive the message that is not processed by the freebird.  

**Arguments of the listener**  

1. `msg` (_Object_): This must be an object with a `data` property that holds the received message of a string or a buffer.  
  
**Examples:**  
    
```js
var transp = new Transport();

transp.on('unhandledMessage', function (msg) {
    console.log('Message not processed by freebird: ' + msg.data.toString());
});
```

*************************************************
<a name="Example"></a>
## 3. TCP Server/Client Example
  
### 3.1 TCP Server

```js
var net = require('net'),
    Transport = require('freebird-transport');

var transp, client;

transp = new Transport();

server = net.createServer(function (c) {
    client = c;

    client.on('end', function () {
        client = null;
    });

    // Message received
    client.on('data', function (data) {
        transp.receive({ data: data });
    });
});

server.listen(4321, function () {
    console.log('TCP server starts');
});

// Implementaion of _send
transp._send = function (msg, callback) {
    var bytes;

    if (typeof msg !== 'object')
        return setImmediate(callback, new TypeError('msg should be an object'));

    if (typeof msg.data === 'string')
        msg.data = new Buffer(msg.data);

    if (!Buffer.isBuffer(msg.data))
        return setImmediate(callback, new TypeError('msg.data should be a string or a buffer'));

    bytes = msg.data.length;

    if (!client)
        return setImmediate(callback, new Error('No client connected'));

    client.write(msg.data);
    setImmediate(callback, null, bytes);
};

module.exports = transp;
```

### 3.2 TCP Client

```js
var net = require('net'),
    Transport = require('freebird-transport');

var transp, client;

transp = new Transport();
client = net.createConnection(4321, 'localhost', function () {
    transp._send = function (msg, callback) {
        var bytes;

        if (typeof msg.data === 'string')
            msg.data = new Buffer(msg.data);

        if (!Buffer.isBuffer(msg.data))
            return setImmediate(callback, new TypeError('msg.data should be a string or a buffer'));

        bytes = msg.data.length;

        if (!client)
            return setImmediate(callback, new Error('No client created'));

        client.write(msg.data);
        setImmediate(callback, null, bytes);
    };
});

client.on('end', function () {
    client = null;
});

// Message received
client.on('data', function (data) {
    transp.receive({ data: data });
});

module.exports = transp;
```