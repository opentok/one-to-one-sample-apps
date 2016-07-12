/* global define */
(function () {
  var _this;

  var _createCookie = function (name, value, days) {
    var expires = '';
    var date;
    var guid;
    if (days) {
      date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = ['; expires=', date.toGMTString()].join('');
    }
    guid = [name, '=', value, expires, '; path=/'].join('');
    document.cookie = guid;
    return guid;
  };

  var _readCookie = function (name) {
    var nameEQ = [name, '='].join('');
    var ca = document.cookie.split(';');
    var i;
    var c;
    for (i = 0; i < ca.length; i++) {
      c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  };

  var _generateUuid = function () {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = '0123456789abcdef';
    var i;
    for (i = 0; i < 36; i++) {
      s.push(hexDigits.substr(Math.floor(Math.random() * 0x10), 1));
    }
    // bits 12-15 of the time_hi_and_version field to 0010
    s[14] = '4';
    // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';

    return s.join('');
  };

  var _updateCookie = function (name) {
    _this.analyticsData.guid = _readCookie(name) || _createCookie(name, _generateUuid(), 7);
  };

  var _checkData = function () {
    /* eslint-disable max-len */
    if (!_this.analyticsData.clientVersion) {
      console.log('Error. The clientVersion field cannot be null in the log entry');
      throw new Error('The clientVersion field cannot be null in the log entry');
    }
    if (!_this.analyticsData.source) {
      console.log('Error. The source field cannot be null in the log entry');
      throw new Error('The source field cannot be null in the log entry');
    }
    if (!_this.analyticsData.componentId) {
      console.log('Error. The componentId field cannot be null in the log entry');
      throw new Error('The componentId field cannot be null in the log entry');
    }
    if (!_this.analyticsData.name) {
      console.log('Error. The name field cannot be null in the log entry');
      throw new Error('The guid field cannot be null in the log entry');
    }
    if (!_this.analyticsData.logVersion) {
      _this.analyticsData.logVersion = '2';
    }
    if (_this.analyticsData.clientSystemTime === 0) {
      _this.analyticsData.clientSystemTime = new Date().getTime();
    }
    /* eslint-enable max-len */
  };

  var _sendData = function () {
    var http = new XMLHttpRequest();
    var payload = _this.analyticsData.payload || '';

    if (typeof (payload) === 'object') {
      payload = JSON.stringify(payload);
    }

    _this.analyticsData.payload = payload;

    http.open('POST', _this.url, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.send(JSON.stringify(_this.analyticsData));
  };

  var OTKAnalytics = function (data) {
    this.url = 'https://hlg.tokbox.com/prod/logging/ClientEvent';
    this.analyticsData = data;
    _this = this;
    _updateCookie(data.name);
  };

  OTKAnalytics.prototype = {
    constructor: OTKAnalytics,
    logEvent: function (data) {
      _this.analyticsData.action = data.action;
      _this.analyticsData.variation = data.variation;
      _this.analyticsData.clientSystemTime = new Date().getTime();
      // check values
      _checkData();

      // send data to analytics server
      _sendData();
    },
    addSessionInfo: function (data) {
      if (!data.sessionId) {
        console.log('Error. The sessionId field cannot be null in the log entry');
        throw new Error('The sessionId field cannot be null in the log entry');
      }
      _this.analyticsData.sessionId = data.sessionId;

      if (!data.connectionId) {
        console.log('Error. The connectionId field cannot be null in the log entry');
        throw new Error('The connectionId field cannot be null in the log entry');
      }
      _this.analyticsData.connectionId = data.connectionId;

      if (data.partnerId === 0) {
        console.log('Error. The partnerId field cannot be null in the log entry');
        throw new Error('The partnerId field cannot be null in the log entry');
      }
      _this.analyticsData.partnerId = data.partnerId;
    },
  };

  if (typeof exports === 'object') {
    module.exports = OTKAnalytics;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return OTKAnalytics;
    });
  } else {
    this.OTKAnalytics = OTKAnalytics;
  }
}.call(this));
