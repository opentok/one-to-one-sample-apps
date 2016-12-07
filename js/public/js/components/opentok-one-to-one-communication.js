/* global OT OTKAnalytics define */
(function () {

  /** Include external dependencies */
  var _;
  var $;
  var OTKAnalytics;

  if (typeof module === 'object' && typeof module.exports === 'object') {
    /* eslint-disable import/no-unresolved */
    _ = require('underscore');
    $ = require('jquery');
    OTKAnalytics = require('opentok-solutions-logging');
    /* eslint-enable import/no-unresolved */
  } else {
    _ = this._;
    $ = this.$;
    OTKAnalytics = this.OTKAnalytics;
  }

  /** Private variables */
  var _this; // Reference to instance of CommunicationAccPack
  var _session;

  /**
   * Accelerator Pack Common Layer and Associated Methods
   */

  // Reference to Accelerator Pack
  var _accPack;

  // Register events with the AP API
  var _registerEvents = function () {

    if (!_accPack) {
      return;
    }

    var events = [
      'startCall',
      'endCall',
      'callPropertyChanged',
      'subscribeToCamera',
      'startViewingSharedScreen',
      'endViewingSharedScreen'
    ];

    _accPack.registerEvents(events);
  };

  // Trigger an event using the AP API
  var _triggerEvent = function (event, data) {
    if (!!_accPack) {
      _accPack.triggerEvent(event, data);
    }
  };

  /** Analytics */
  var _otkanalytics;

  // vars for the analytics logs. Internal use
  var _logEventData = {
    clientVersion: 'js-vsol-1.0.0',
    componentId: 'oneToOneSample',
    name: 'guidOneToOneSample',
    actionInitialize: 'Init',
    actionStartComm: 'Start',
    actionStopComm: 'End',
    variationAttempt: 'Attempt',
    variationError: 'Failure',
    variationSuccess: 'Success',
  };

  var _logAnalytics = function () {

    // init the analytics logs
    var _source = window.location.href;

    var otkanalyticsData = {
      clientVersion: _logEventData.clientVersion,
      source: _source,
      componentId: _logEventData.componentId,
      name: _logEventData.name
    };

    _otkanalytics = new OTKAnalytics(otkanalyticsData);

    var sessionInfo = {
      sessionId: _session.id,
      connectionId: _session.connection.connectionId,
      partnerId: _session.apiKey
    };

    _otkanalytics.addSessionInfo(sessionInfo);

  };

  var _log = function (action, variation) {

    var data = {
      action: action,
      variation: variation
    };
    _otkanalytics.logEvent(data);
  };

  /** End Analytics */

  /** Private Methods */

  var _initPublisherCamera = function () {

    var props;
    if (typeof _this.options.localCallProperties === 'function') {
      props = _this.options.localCallProperties('publisher');
    } else {
      props = _this.options.localCallProperties;
    }

    if (_this.options.user) {
      props.name = _this.options.user.name;
    }

    _this.publisher = OT.initPublisher(_getStreamContainer('publisher'), props, function (error) {
      if (error) {
        console.log('Error starting a call', error);
      }
    });
  };


  var _publish = function () {

    _initPublisherCamera();

    var publisher = _session.publish(_this.publisher, function (error) {
      if (error) {
        console.log(['Error starting a call', error.code, '-', error.message].join(''));
        var message;
        if (error.code === 1010) {
          message = [error.message, '. Check your network connection.'].join('');
        } else {
          message = error.message;
        }
        console.log(error, message);
        _log(_logEventData.actionStartComm, _logEventData.variationError);
      } else {
        _triggerEvent('startCall', publisher)
      }
    });

    return publisher;
  };

  var _unpublish = function () {
    if (_this.publisher) {
      _session.unpublish(_this.publisher);
    }
  };


  var _unsubscribeStreams = function () {
    Object.keys(_this.streams).forEach(function (streamId) {
      var subscribers = _session.getSubscribersForStream(_this.streams[streamId]);
      subscribers.forEach(function (subscriber) {
        _session.unsubscribe(subscriber);
      });
    });
    _this.subscriber = null;
    _this.streams = {};
  };

  /**
   * Get the container element for the publisher/subscriber stream
   * @param {String} type - 'publisher' or 'subcriber'
   * @param {Object} stream - An OpenTok stream object
   * @returns {Object} - The container DOM element
   *
   */
  var _getStreamContainer = function (type, stream) {

    var userDefined = _this.options[`${type}Container`];

    var getUserDefinedContainer = function () {
      if (typeof userDefined === 'function') {
        var container = userDefined(stream);
        return typeof container === 'string' ? document.querySelector(container) : container;
      } else if (typeof userDefined === 'string') {
        return document.querySelector(userDefined);
      } else {
        return userDefined;
      }
    };

    if (userDefined) {
      return getUserDefinedContainer();
    } else {
      if (type === 'publisher') {
        return document.getElementById('videoHolderSmall');
      } else if (type === 'subscriber') {
        if (stream.videoType === 'screen') {
          return 'videoHolderSharedScreen';
        } else {
          return 'videoHolderBig';
        }
      }
    }
  };

  var _subscribeToStream = function (stream) {

    if (_this.streams[stream.id]) {
      return;
    }

    _this.streams[stream.id] = stream;

    var options;
    if (stream.videoType === 'screen') {
      if (typeof _this.options.localScreenProperties === 'function') {
        options = _this.options.localScreenProperties('subscriber');
      } else {
        options = _this.options.localScreenProperties;
      }
    } else {
      if (typeof _this.options.localCallProperties === 'function') {
        options = _this.options.localCallProperties('subscriber');
      } else {
        options = _this.options.localCallProperties;
      }
    }


    var container = _getStreamContainer('subscriber', stream);

    var subscriber = _session.subscribe(stream,
      container,
      options,
      function (error) {
        if (error) {
          var connectionError = error.code === 1010 ? 'Check your network connection.' : '';
          console.log(error, connectionError);
        } else {
          if (stream.videoType === 'camera' || stream.videoType === undefined) {
            _triggerEvent('subscribeToCamera', subscriber);
            _this.subscriber = subscriber;
          } else if (stream.videoType === 'screen') {
            _triggerEvent('startViewingSharedScreen', subscriber);
          }
        }
      });
  };


  /** Events & Handlers */

  var _handleStart = function (event) {
    return event;
  };

  var _handleEnd = function (event) {
    return event;
  };

  var _handleStreamCreated = function (event) {
    _this._remoteParticipant = event.connection;
    if (_this.options.inSession) {
      _subscribeToStream(event.stream);
    }
  };

  var _handleStreamDestroyed = function (event) {
    var streamDestroyedType = event.stream.videoType;

    if (streamDestroyedType === 'camera' || streamDestroyedType === undefined) {
      _this.subscriber = null;
      _this._remoteParticipant = null;

    } else if (streamDestroyedType === 'screen') {
      _triggerEvent('endViewingSharedScreen');
    } else {
      _.each(_this.subscribers, function (subscriber) {
        _subscribeToStream(subscriber);
      });
    }

  };

  var _handleLocalPropertyChanged = function (event) {

    var eventData;

    if (event.changedProperty === 'hasAudio') {
      eventData = {
        property: 'Audio',
        enabled: event.newValue
      };
    } else {
      eventData = {
        property: 'Video',
        enabled: event.newValue
      };
    }

    _triggerEvent('callPropertyChanged', eventData);
  };

  // Register listeners with the AP API
  var _setEventListeners = function () {

    // Are we using this module in concert with other acc packs or on its own
    if (_accPack) {
      _accPack.registerEventListener('streamCreated', _handleStreamCreated);
      _accPack.registerEventListener('streamDestroyed', _handleStreamDestroyed);
    } else {
      _session.on('streamCreated', _handleStreamCreated);
      _session.on('streamDestroyed', _handleStreamDestroyed);
    }

  };

  /**
   * Validates options and returns a filtered hash to be added to the instance
   * @param {object} options
   * @param {array} ignore - Properties that should not be included in options
   */
  var _validateOptions = function (options, ignore) {

    if (!options || !options.session) {
      throw new Error('No session provided.');
    }

    return _.defaults(_.omit(options, ignore));
  };

  /**
   * @constructor
   * Represents a one-to-one AV communication layer
   * @param {Object} options
   * @param {Object} options.session
   * @param {String} options.sessionId
   * @param {String} options.apiKey
   * @param {Array} options.streams
   * @param {Boolean} options.annotation
   * @param {String | Function} [options.localCallProperties]
   * @param {String | Function} [options.localScreenProperties]
   * @param {String | Function} [options.publisherContainer]
   * @param {String | Function} [options.subscriberContainer]
   */
  var CommunicationAccPack = function (options) {

    // Save a reference to this
    _this = this;

    var nonOptionProps = ['streams'];
    _this.options = _validateOptions(options, nonOptionProps);
    _this.subscriber = null; // Single camera subscriber
    _.extend(_this, _.defaults(_.pick(options, nonOptionProps), {
      streams: {} // All subscribed streams
    }));

    _session = _.property('session')(options);
    _accPack = _.property('accPack')(options) || _accPack;

    _registerEvents();
    _setEventListeners();

    // init analytics logs
    _logAnalytics();
    _log(_logEventData.actionInitialize, _logEventData.variationAttempt);
    _log(_logEventData.actionInitialize, _logEventData.variationSuccess);

  };


  // Prototype methods
  CommunicationAccPack.prototype = {
    constructor: CommunicationAccPack,
    start: function () {
      // TODO: Managing call status: calling, startCall,...using the recipient value

      _log(_logEventData.actionStartComm, _logEventData.variationAttempt);

      _this.options.inSession = true;

      _this.publisher = _publish('camera');

      $.when(_this.publisher.on('streamCreated'))
        .done(function (event) {
          _handleStart(event);
        })
        .promise(); // call has been initialized

      _this.publisher.on('streamDestroyed', function (event) {
        console.log('stream destroyed');
        _handleEnd(event); // call has been finished
      });

      _this.publisher.session.on('streamPropertyChanged', function (event) {
        if (_this.publisher.stream === event.stream) {
          _handleLocalPropertyChanged(event);
        }
      }); // to handle audio/video changes

      Object.keys(_this.streams).forEach(function (streamId) {
        _subscribeToStream(_this.streams[streamId]);
      });

      _session.streams.forEach(function (stream) {
        _subscribeToStream(stream);
      });

      _log(_logEventData.actionStartComm, _logEventData.variationSuccess);
    },
    end: function () {
      _log(_logEventData.actionStopComm, _logEventData.variationAttempt);

      _this.options.inSession = false;
      _unpublish('camera');
      _unsubscribeStreams();

      _triggerEvent('endCall');

      _log(_logEventData.actionStopComm, _logEventData.variationSuccess);

    },
    enableLocalAudio: function (enabled) {
      _this.publisher && _this.publisher.publishAudio(enabled);
    },
    enableLocalVideo: function (enabled) {
      _this.publisher && _this.publisher.publishVideo(enabled);
    },
    enableRemoteVideo: function (enabled) {
      _this.subscriber && _this.subscriber.subscribeToVideo(enabled);
    },
    enableRemoteAudio: function (enabled) {
      _this.subscriber && _this.subscriber.subscribeToAudio(enabled);
    }
  };

  if (typeof exports === 'object') {
    module.exports = CommunicationAccPack;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return CommunicationAccPack;
    });
  } else {
    this.CommunicationAccPack = CommunicationAccPack;
  }

}.call(this));
