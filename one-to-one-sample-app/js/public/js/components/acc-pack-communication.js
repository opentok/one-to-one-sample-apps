var CommunicationAccPack = (function() {

  var _this;

  var _otkanalytics;
  //vars for the analytics logs. Internal use
  var logEventData = {
    clientVersion: 'js-vsol-1.0.0',
    source: 'avcommunication_acc_pack',
    actionInitialize: 'initialize',
    actionStartComm: 'start',
    actionStopComm: 'stop',
    variationAttempt: 'Attempt',
    variationError: 'Failure',
    variationSuccess: 'Success'
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
  var Communication = function(options) {

    // Save a reference to this
    _this = this;

    var nonOptionProps = ['accPack', 'session', 'subscribers', 'streams'];
    _this.options = _validateOptions(options, nonOptionProps);
    _.extend(_this, _.defaults(_.pick(options, nonOptionProps), {subscribers: [], streams: []}));

    _registerEvents();
    _setEventListeners();

    //init analytics logs
    _logAnalytics();
    _log(logEventData.actionInitialize, logEventData.variationAttempt);
    _log(logEventData.actionInitialize, logEventData.variationSuccess)

  };


  /** Private Methods */

  /**
   * Validates options and returns a filtered hash to be added to the instance
   * @param {object} options
   * @param {array} ignore - Properties that should not be included in options
   */
  var _validateOptions = function(options, ignore) {

    if (!options || !options.session) {
      throw new Error('No session provided.');
    }

    return _.defaults(_.omit(options, ignore));
  };

  var _triggerEvent;
  var _registerEvents = function() {

    if (!this.accPack) {
      return; }

    var events = [
      'startCall',
      'endCall',
      'startViewingSharedScreen',
      'endViewingSharedScreen'
    ];

    _triggerEvent = _this.accPack.registerEvents(events);
  };

  var _setEventListeners = function() {

    // Are we using this module in concert with other acc packs or on its own
    if (_this.accPack) {
      _this.accPack.registerEventListener('streamCreated', _handleStreamCreated);
      _this.accPack.registerEventListener('streamDestroyed', _handleStreamDestroyed);
    } else {
      _this.session.on('streamCreated', _handleStreamCreated);
      _this.session.on('streamDestroyed', _handleStreamDestroyed);
    }

  };

  var _logAnalytics = function() {

    var otkanalyticsData = {
      sessionId: _this.options.sessionId,
      connectionId: _this.session.connection.connectionId,
      partnerId: _this.options.apiKey,
      clientVersion: logEventData.clientVersion,
      source: logEventData.source
    };

    //init the analytics logs
    _otkanalytics = new OTKAnalytics(otkanalyticsData);
  };

  var _log = function(action, variation) {
    var data = {
      action: action,
      variation: variation
    };
    _otkanalytics.logEvent(data);
  };

  var _publish = function(type) {

    currentSource = type;

    var handler = _this.onError;

    _initPublisherCamera();

    return _this.session.publish(_this.publisher, function(error) {
      if (error) {
        console.log("Error starting a call " + error.code + " - " + error.message);
        error.message = "Error starting a call";
        if (error.code === 1010) {
          var errorStr = error.message + ". Check your network connection.";
          error.message = errorStr;
        }
        _handleError(error, handler);
        _log(logEventData.actionStartComm, logEventData.variationError);
      }
    });
  };

  var _unpublish = function() {
    if (_this.publisher) {
      _this.session.unpublish(_this.publisher);
    }
  };

  var _initPublisherCamera = function() {
    if (_this.options.user) {
      _this.options.localCallProperties.name = _this.options.user.name;
    }
    _this.publisher = OT.initPublisher('videoHolderSmall', _this.options.localCallProperties, function(error) {
      if (error) {
        error.message = "Error starting a call";
        _handleError(error, handler);
      }
      //_this.publishers.camera.on('streamDestroyed', _this._publisherStreamDestroyed);
    });
  };

  var _publisherStreamDestroyed = function(event) {
    console.log('publisherStreamDestroyed', event);
    event.preventDefault();
  };

  var _subscribeToStream = function(stream) {
    var handler = _this.onError;
    if (stream.videoType === 'screen') {
      var options = _this.options.localScreenProperties
    } else {
      var options = _this.options.localCallProperties
    }

    var videoContainer = stream.videoType === 'screen' ? 'videoHolderSharedScreen' : 'videoHolderBig';

    var subscriber = _this.session.subscribe(stream,
      videoContainer,
      options,
      function(error) {
        if (error) {
          console.log('Error starting a call ' + error.code + ' - ' + error.message);
          error.message = 'Error starting a call';
          if (error.code === 1010) {
            var errorStr = error.message + '. Check your network connection.'
            error.message = errorStr;
          }
          _handleError(error, handler);
        } else {

          _this.streams.push(subscriber);

          if (stream.videoType === 'screen') {
            console.log('starting to view shared screen here');
            _triggerEvent && _triggerEvent('startViewingSharedScreen', subscriber);
          }
        }
      });

    _this.subscriber = subscriber;
  };

  var _unsubscribeStreams = function() {
    _.each(_this.streams, function(stream) {
      _this.session.unsubscribe(stream);
    })
  };

  // Private handlers
  var _handleStart = function(event) {

  };

  var _handleEnd = function(event) {

  };

  var _handleStreamCreated = function(event) {
    //TODO: check the joined participant
    _this.subscribers.push(event.stream);
    _this._remoteParticipant = event.connection;
    _subscribeToStream(event.stream);

  };

  var _handleStreamDestroyed = function(event) {
    console.log('Participant left the call');
    var streamDestroyedType = event.stream.videoType;

    //remove to the subscribers list
    var index = _this.subscribers.indexOf(event.stream);
    _this.subscribers.splice(index, 1);

    if (streamDestroyedType === 'camera') {
      _this.subscriber = null; //to review
      _this._remoteParticipant = null;

    } else if (streamDestroyedType === 'screen') {
      _triggerEvent && _triggerEvent('endViewingSharedScreen');
    } else {
      _.each(_this.subscribers, function(subscriber) {
        _subscribeToStream(subscriber);
      });
    }

  };

  var _handleLocalPropertyChanged = function(event) {

    if (event.changedProperty === 'hasAudio') {
      var eventData = {
        property: 'Audio',
        enabled: event.newValue
      }
    } else {
      var eventData = {
        property: 'Video',
        enabled: event.newValue
      }
    }
  }

  var _handleError = function(error, handler) {
    if (handler && typeof handler === 'function') {
      handler(error);
    }
  };

  // Prototype methods
  Communication.prototype = {
    constructor: Communication,
    start: function(recipient) {
      //TODO: Managing call status: calling, startCall,...using the recipient value

      _log(logEventData.actionStartComm, logEventData.variationAttempt);

      _this.options.inSession = true;

      _this.publisher = _publish('camera');

      $.when(_this.publisher.on('streamCreated'))
        .done(function(event) {
          _handleStart(event)
        })
        .promise(); //call has been initialized

      _this.publisher.on('streamDestroyed', function(event) {
        console.log("stream destroyed");
        _handleEnd(event); //call has been finished
      });

      _this.publisher.session.on('streamPropertyChanged', function(event) {
        if (_this.publisher.stream === event.stream) {
          _handleLocalPropertyChanged(event)
        }
      }); //to handle audio/video changes

      _.each(_this.subscribers, function(subscriber) {
        _subscribeToStream(subscriber);
      });

      _triggerEvent && _triggerEvent('startCall');

      _log(logEventData.actionStartComm, logEventData.variationSuccess);
    },
    end: function() {
      _log(logEventData.actionStopComm, logEventData.variationAttempt);
      _this.options.inSession = false;
      _unpublish('camera');
      _unsubscribeStreams();
      _triggerEvent && _triggerEvent('endCall');
      _log(logEventData.actionStopComm, logEventData.variationSuccess);
    },
    enableLocalAudio: function(enabled) {
      _this.publisher.publishAudio(enabled);
    },
    enableLocalVideo: function(enabled) {
      _this.publisher.publishVideo(enabled);
    },
    enableRemoteVideo: function(enabled) {
      _this.subscriber.subscribeToVideo(enabled);
    },
    enableRemoteAudio: function(enabled) {
      _this.subscriber.subscribeToAudio(enabled);
    }
  };

  return Communication;

})();
