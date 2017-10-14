'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (_ref) {
  var backpack = _ref.backpack,
      bakes = _ref.bakes,
      slash = _ref.slash,
      target = _ref.target;

  return new _promise2.default(function (resolve, reject) {
    if (!Buffer.alloc) {
      throw (0, _log.wasReported)('Your node.js does not have Buffer.alloc. Please upgrade!');
    }

    var prelude = backpack.prelude,
        entrypoint = backpack.entrypoint,
        stripes = backpack.stripes;

    entrypoint = (0, _common.snapshotify)(entrypoint, slash);
    stripes = stripes.slice();

    var vfs = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(stripes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var stripe = _step.value;
        var snap = stripe.snap;

        snap = (0, _common.snapshotify)(snap, slash);
        if (!vfs[snap]) vfs[snap] = {};
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var meter = void 0;
    var count = 0;

    function pipeToNewMeter(s) {
      meter = (0, _streamMeter2.default)();
      return s.pipe(meter);
    }

    function next(s) {
      count += 1;
      return pipeToNewMeter(s);
    }

    var payloadPlace = 0;
    var payloadSize = 0;
    var prevStripe = void 0;

    (0, _multistream2.default)(function (cb) {
      if (count === 0) {
        return cb(undefined, next(_fs2.default.createReadStream(target.binaryPath)));
      } else if (count === 1) {
        payloadPlace += meter.bytes;
        return cb(undefined, next((0, _simpleBufferstream2.default)(makeBakeryBoxFromBakes(bakes))));
      } else if (count === 2) {
        payloadPlace += meter.bytes;
        return cb(undefined, next((0, _simpleBufferstream2.default)(makePayloadHeader(0))));
      } else if (count === 3) {
        if (prevStripe && !prevStripe.skip) {
          var _prevStripe = prevStripe,
              snap = _prevStripe.snap,
              store = _prevStripe.store;

          snap = (0, _common.snapshotify)(snap, slash);
          vfs[snap][store] = [payloadSize, meter.bytes];
          payloadSize += meter.bytes;
        }

        if (stripes.length) {
          // clone to prevent 'skip' propagate
          // to other targets, since same stripe
          // is used for several targets
          var stripe = (0, _assign2.default)({}, stripes.shift());
          prevStripe = stripe;

          if (stripe.buffer) {
            if (stripe.store === _common.STORE_BLOB) {
              var _snap = (0, _common.snapshotify)(stripe.snap, slash);
              return (0, _fabricator.fabricateTwice)(bakes, target.fabricator, _snap, stripe.buffer, function (error, buffer) {
                if (error) {
                  _log.log.warn(error.message);
                  stripe.skip = true;
                  return cb(undefined, (0, _simpleBufferstream2.default)(Buffer.alloc(0)));
                }

                cb(undefined, pipeToNewMeter((0, _simpleBufferstream2.default)(buffer)));
              });
            } else {
              return cb(undefined, pipeToNewMeter((0, _simpleBufferstream2.default)(stripe.buffer)));
            }
          } else if (stripe.file) {
            if (stripe.file === target.output) {
              return cb((0, _log.wasReported)('Trying to take executable into executable', stripe.file));
            }

            _assert2.default.equal(stripe.store, _common.STORE_CONTENT); // others must be buffers from walker
            return cb(undefined, pipeToNewMeter(_fs2.default.createReadStream(stripe.file)));
          } else {
            (0, _assert2.default)(false, 'producer: bad stripe');
          }
        } else {
          return cb(undefined, next((0, _simpleBufferstream2.default)(makePreludeBoxFromPrelude(prelude.replace('%VIRTUAL_FILESYSTEM%', (0, _stringify2.default)(vfs)).replace('%DEFAULT_ENTRYPOINT%', (0, _stringify2.default)(entrypoint))))));
        }
      } else {
        return cb();
      }
    }).on('error', function (error) {
      reject(error);
    }).pipe(_fs2.default.createWriteStream(target.output)).on('error', function (error) {
      reject(error);
    }).on('close', function () {
      _fs2.default.open(target.output, 'r+', function (error, fd) {
        if (error) return reject(error);
        var buffer = makePayloadHeader(payloadSize);
        _fs2.default.write(fd, buffer, 0, buffer.length, payloadPlace, function (error2) {
          if (error2) return reject(error2);
          _fs2.default.close(fd, function (error3) {
            if (error3) return reject(error3);
            resolve();
          });
        });
      });
    });
  });
};

var _common = require('../prelude/common.js');

var _log = require('./log.js');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _simpleBufferstream = require('simple-bufferstream');

var _simpleBufferstream2 = _interopRequireDefault(_simpleBufferstream);

var _fabricator = require('./fabricator.js');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _multistream = require('multistream');

var _multistream2 = _interopRequireDefault(_multistream);

var _streamMeter = require('stream-meter');

var _streamMeter2 = _interopRequireDefault(_streamMeter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeBakeryBoxFromBakes(bakes) {
  var parts = [];
  if (bakes.length) {
    for (var i = 0; i < bakes.length; i += 1) {
      parts.push(Buffer.from(bakes[i]));
      parts.push(Buffer.alloc(1));
    }
    parts.push(Buffer.alloc(1));
  }
  var buffer = Buffer.concat(parts);

  var header = Buffer.alloc(16);
  header.writeInt32LE(0x4818c4df, 0);
  header.writeInt32LE(0x7ac30670, 4);
  header.writeInt32LE(0x56558a76, 8);
  header.writeInt32LE(buffer.length, 12);
  return Buffer.concat([header, buffer]);
}

function makePreludeBoxFromPrelude(prelude) {
  var buffer = Buffer.from('(function(process, require, console, EXECPATH_FD, PAYLOAD_POSITION, PAYLOAD_SIZE) { ' + prelude + '\n})' // dont remove \n
  );

  var header = Buffer.alloc(16);
  header.writeInt32LE(0x26e0c928, 0);
  header.writeInt32LE(0x41f32b66, 4);
  header.writeInt32LE(0x3ea13ccf, 8);
  header.writeInt32LE(buffer.length, 12);
  return Buffer.concat([header, buffer]);
}

function makePayloadHeader(payloadSize) {
  var header = Buffer.alloc(16);
  header.writeInt32LE(0x75148eba, 0);
  header.writeInt32LE(0x6fbda9b4, 4);
  header.writeInt32LE(0x2e20c08d, 8);
  header.writeInt32LE(payloadSize, 12);
  return header;
}