/* global OT OTKAnalytics define */
(function () {

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
    componentId: 'avCommunicationAccPack',
    actionInitialize: 'Init',
    actionStartComm: 'Start',
    actionStopComm: 'Stop',
    variationAttempt: 'Attempt',
    variationError: 'Failure',
    variationSuccess: 'Success'
  };

  var _createCookie = function (name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    var guid = name+"="+value+expires+"; path=/";
    document.cookie = guid;
    return guid;
  }

  var _readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  } 

  var _generateUuid = function() {

        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
  }

  var _logAnalytics = function () {

    // init the analytics logs
    var _source = window.location.href;
    
    var _guid = _readCookie('guidAVCommunication')
    if ( !_guid) {
      _createCookie('guidAVCommunication', _generateUuid(), 7);
    }  
   
    var otkanalyticsData = {
      clientVersion: _logEventData.clientVersion,
      source: _source,
      componentId: _logEventData.componentId,
      guid: _guid
    };
    
    _otkanalytics = new OTKAnalytics(otkanalyticsData);
    var sessionInfo = {
      sessionId: _session.id,
      connectionId: _session.connection.connectionId,
      partnerId: _session.apiKey
    }

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

    var props = _this.options.localCallProperties;

    if (_this.options.user) {
      props.name = _this.options.user.name;
    }

    _this.publisher = OT.initPublisher('videoHolderSmall', props, function (error) {
      if (error) {
        console.log('Error starting a call', error);
      }
    });
  };


  var _publish = function () {

    _initPublisherCamera();

    return _session.publish(_this.publisher, function (error) {
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
      }
    });
  };

  var _unpublish = function () {
    if (_this.publisher) {
      _session.unpublish(_this.publisher);
    }
  };


  var _unsubscribeStreams = function () {
    _.each(_this.streams, function (stream) {
      _session.unsubscribe(stream);
    });
  };

  var _subscribeToStream = function (stream) {

    var options;
    if (stream.videoType === 'screen') {
      options = _this.options.localScreenProperties;
    } else {
      options = _this.options.localCallProperties;
    }

    var videoContainer;
    if (stream.videoType === 'screen') {
      videoContainer = 'videoHolderSharedScreen';
    } else {
      videoContainer = 'videoHolderBig';
    }

    var subscriber = _session.subscribe(stream,
      videoContainer,
      options,
      function (error) {
        if (error) {
          var connectionError = error.code === 1010 ? 'Check your network connection.' : '';
          console.log(error, connectionError);
        } else {

          _this.streams.push(subscriber);

          if (stream.videoType === 'screen') {
            _triggerEvent('startViewingSharedScreen', subscriber);
          }
        }
      });

    _this.subscriber = subscriber;
  };


  /** Events & Handlers */

  var _handleStart = function (event) {
    return event;
  };

  var _handleEnd = function (event) {
    return event;
  };

  var _handleStreamCreated = function (event) {
    // TODO: check the joined participant
    _this.subscribers.push(event.stream);
    _this._remoteParticipant = event.connection;
    _subscribeToStream(event.stream);
  };

  var _handleStreamDestroyed = function (event) {
    console.log('Participant left the call');
    var streamDestroyedType = event.stream.videoType;

    // Remove from the subscribers list
    var index = _this.subscribers.indexOf(event.stream);
    _this.subscribers.splice(index, 1);

    if (streamDestroyedType === 'camera') {
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
   * @param {object} options
   * @param {object} options.session
   * @param {string} options.sessionId
   * @param {string} options.apiKey
   * @param {array} options.subscribers
   * @param {array} options.streams
   * @param {boolean} options.annotation
   */
  var CommunicationAccPack = function (options) {

    // Save a reference to this
    _this = this;

    var nonOptionProps = ['subscribers', 'streams'];
    _this.options = _validateOptions(options, nonOptionProps);
    _.extend(_this, _.defaults(_.pick(options, nonOptionProps), {
      subscribers: [],
      streams: []
    }));

    _session = _.property('session')(options);
    _accPack = _.property('accPack')(options);

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

      _.each(_this.subscribers, function (subscriber) {
        _subscribeToStream(subscriber);
      });

      _triggerEvent('startCall');

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
      _this.subscribeer && _this.subscriber.subscribeToVideo(enabled);
    },
    enableRemoteAudio: function (enabled) {
      _this.subscribeer && _this.subscriber.subscribeToAudio(enabled);
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
