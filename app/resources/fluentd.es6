// Copyright 2016 Hewlett-Packard Development Company, L.P.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// END OF TERMS AND CONDITIONS

if (process.env.FLUENTD_HOST && process.env.FLUENTD_PORT) {
  let fluent = require('fluent-logger');

  fluent.configure('authService', {
    host: process.env.FLUENTD_HOST,
    port: process.env.FLUENTD_PORT,
    timeout: 3.0,
    reconnectInterval: 600000 // 10 minutes
  });

  let log = {};
  log.info = function(string) {
    fluent.emit('Info', {message: string});
  };

  log.debug = function(string) {
    fluent.emit('Debug', {message: string});
  };

  log.error = function(string) {
    fluent.emit('Error', {message: string});
  };

  log.warn = function(string) {
    fluent.emit('Warning', {message: string});
  };

  log.warning = function(string) {
    fluent.emit('Warning', {message: string});
  };

  exports.info = log.info;
  exports.debug = log.debug;
  exports.error = log.error;
  exports.warn = log.warn;
  exports.warning = log.warning;
} else {
  module.exports = exports = require('winston');
}
