var net = require('net');
var expect = require('chai').expect;
var Transport = require('../index.js');

var client;
var realClient;
var transp = new Transport();

/***********************************************************************/
/*** Create TCP Server                                               ***/
/***********************************************************************/
var server = net.createServer(function (c) {
    client = c;

    client.on('end', function () {});
    client.on('data', function (data) {
        transp.receive({ data: data });
    });
});

/***********************************************************************/
/*** Create TCP Client                                               ***/
/***********************************************************************/
server.listen(4321, function () {
    realClient = net.createConnection({ port: 4321 }, function () {});
    realClient.on('data', function (data) {});
    realClient.on('end', function () {});
});

/***********************************************************************/
/*** Unit Tests                                                      ***/
/***********************************************************************/
describe('Transport Construction', function () {
    describe('#No _send implemented', function() {
        it('should throw if _send is not implemented when call send()', function () {
            expect(function () {
                var transp = new Transport();
                transp.send({ data: 'Hello' }, function () {});
            }).to.throw(Error);
        });
    });
});

describe('Transport Functional Testing', function () {

    // Implementation of _send
    transp._send = function (msg, callback) {
        if (client) {
            client.write(msg.data);
            if (callback)
                callback(null, msg.data.length);
        } else {
            callback(new Error('No client connected'));
        }
    };

    describe('#_send implemented', function() {
        it('Real client should receive "Hello World"', function (done) {
            realClient.once('data', function (data) {
                if (data.toString() === 'Hello World')
                    done();
            });
            transp.send({ data: 'Hello World' }, function (err, bytes) {});
        });

        it('Server should receive "Hello Node"', function (done) {
            transp.on('message', function (msg) {
                if (msg.data.toString() === 'Hello Node')
                    done();
            });

            realClient.write('Hello Node');
        });
    });
});
