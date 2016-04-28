var Communication = (function () {

  // Constructor
  var CommunicationComponent = function (options) {
    if (!options || !options.session) {
      throw new Error('No session provided.');
    }

    this._session = options.session;

    this.options = options;

    this._session.on('streamCreated', this._handleParticipantJoined.bind(this)); //participant joined to the call

    this._session.on('streamDestroyed', this._handleParticipantLeft.bind(this)); //participant left the call

    var _otkanalyticsData = {
      sessionId: this.options.sessionId,
      connectionId:this.options.session.connection.connectionId,
      partnerId: this.options.apiKey,
      clientVersion: this.options.clientVersion,
      source: this.options.source
    };

    //init the analytics logs
    this._otkanalytics = new OTKAnalytics(_otkanalyticsData);
  };

  // Private methods
  var _publish = function (type) {
    currentSource = type;
    var handler = this.onError;

    this._initPublisherCamera();
    return this._session.publish(this.options.publishers[type], function (error) {
      if (error) {
        console.log("Error starting a call " + error.code + " - " + error.message);
        error.message = "Error starting a call";
        if (error.code === 1010) {
          var errorStr = error.message + ". Check your network connection.";
          error.message = errorStr;
        }
        _handleError(error, handler);
      }
    });
  };

  var _unpublish = function (type) {
    var self = this;
    if (this.options.publishers[type]) {
      self._session.unpublish(this.options.publishers[type]);
    }
  };

  var _initPublisherCamera = function () {
    var self = this;
    if (self.options.user) {
      this.options.localCallProperties.name = self.options.user.name;
    }
    self.options.publishers.camera = OT.initPublisher('videoHolderSmall', self.options.localCallProperties, function (error) {
      if (error) {
        error.message = "Error starting a call";
        _handleError(error, handler);
      }
      //self.options.publishers.camera.on('streamDestroyed', this._publisherStreamDestroyed);
    });
  };

  var _publisherStreamDestroyed = function (event) {
    console.log('publisherStreamDestroyed', event);
    event.preventDefault();
  };

  var _subscribeToStream = function (stream) {
    var self = this;
    var handler = this.onError;
    if (stream.videoType === "screen") {
      var options = self.options.localScreenProperties
    } else {
      var options = self.options.localCallProperties
    }

    var subscriber = self._session.subscribe(stream,
      'videoHolderBig',
      options, function (error) {
        if (error) {
          console.log("Error starting a call " + error.code + " - " + error.message);
          error.message = "Error starting a call";
          if (error.code === 1010) {
            var errorStr = error.message + ". Check your network connection."
            error.message = errorStr;
          }
          _handleError(error, handler);
        } else {
          self.options.streams.push(subscriber);
          console.log('Subscriber added.');
          var handler = self.onSubscribe;
          if (handler && typeof handler === 'function') {
            handler(stream);
          }

        }
      });
    self.subscriber = subscriber;
  };

  var _unsubscribeStreams = function () {
    var self = this;
    _.each(this.options.streams, function (stream) {
      self._session.unsubscribe(stream);
    })
  };

  // Private handlers
  var _handleStart = function (event) {
    var self = this;
    var handler = this.onStarted;
    if (handler && typeof handler === 'function') {
      handler();
    }
  };

  var _handleEnd = function (event) {
    console.log("Call ended");
    var self = this;

    var handler = this.onEnded;
    if (handler && typeof handler === 'function') {
      handler();
    }
  };

  var _handleParticipantJoined = function (event) {
    console.log("Participant joined to the call");
    var self = this;
    //TODO: check the joined participant
    self.options.subscribers.push(event.stream);
    if (self.options.inSession) {
      self._remoteParticipant = event.connection;
      self._subscribeToStream(event.stream);
    }

    var handler = this.onParticipantJoined;
    if (handler && typeof handler === 'function') {
      handler(event); //TODO: it should be the user
    }
  };

  var _handleParticipantLeft = function (event) {
    var self = this;
    console.log('Participant left the call');
    var streamDestroyedType = event.stream.videoType;

    //remove to the subscribers list
    var index = self.options.subscribers.indexOf(event.stream);
    self.options.subscribers.splice(index, 1);

    if (streamDestroyedType === 'camera') {

      this.subscriber = null; //to review
      self._remoteParticipant = null;
      var handler = this.onParticipantLeft;

    } else if (streamDestroyedType === 'screen') {

      self.onScreenSharingEnded();

    } else {
      _.each(self.options.subscribers, function (subscriber) {
        self._subscribeToStream(subscriber);
      });
    }

//        var handler = this.onParticipantLeft(streamDestroyedType);
    var eventData = {
      userId: 'event.stream.connectionId'
    };
    if (handler && typeof handler === 'function') {
      handler(eventData); //TODO: it should be the user (userId and username)
    }
  };

  var _handleLocalPropertyChanged = function (event) {
    console.log('Local property changed');
    var handler = this.onEnableLocalMedia;
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
    var handler = this.onEnableLocalMedia;
    if (handler && typeof handler === 'function') {
      handler(eventData);
    }
  };

  var _handleRemotePropertyChanged = function (data) {
    //TODO
  };

  var _handleError = function (error, handler) {
    if (handler && typeof handler === 'function') {
      handler(error);
    }
  };
  
  var _log = function (action, variation) {
    var self = this;
   
    var data = {
        action: action,
        variation: variation
    };
    self._otkanalytics.logEvent(data);
  };

  // Prototype methods
  CommunicationComponent.prototype = {
    constructor: Communication,

    onStarted: function () {
    },
    onEnded: function () {
    },
    onSubscribe: function () {
    },
    onParticipantJoined: function (event) {
    },
    onParticipantLeft: function (event) {
    },
    onEnableLocalMedia: function (event) {
    },
    onEnableRemoteMedia: function (event) {
    },
    onError: function (error) {
    },

    start: function (recipient) {
      //TODO: Managing call status: calling, startCall,...using the recipient value
      var self = this;

      //add START_COMM attempt log event 
      _log.call(self, self.options.actionStartComm, self.options.variationAttempt);
      
      this.options.inSession = true;

      this.publisher = this._publish('camera');

      $.when(this.publisher.on('streamCreated'))
        .done(function (event) {
          self._handleStart(event);
          //add START_COMM success log event 
          _log.call(self, self.options.actionStartComm, self.options.variationSuccess);
        })
        .promise(); //call has been initialized

      this.publisher.on('streamDestroyed', function (event) {
        console.log("stream destroyed");
        self._handleEnd(event); //call has been finished
        //add END_COMM success log event 
        _log.call(self, self.options.actionEndComm, self.options.variationSuccess);
      });

      this.publisher.session.on('streamPropertyChanged', function (event) {
        if (self.publisher.stream === event.stream)
          self._handleLocalPropertyChanged(event)
      }); //to handle audio/video changes
    
      this.publisher.on('error', function (event) {
        _log.call(this, this.options.actionStartComm, this.options.variationFailure)
      });

      if (this.options.subscribers.length > 0) {
        _.each(this.options.subscribers, function (subscriber) {
          self._subscribeToStream(subscriber);
        });
      }
    },
    end: function () {
      //add END_COMM attempt log event 
      _log.call(this, this.options.actionEndComm, this.options.variationAttempt);
      this.options.inSession = false;
      this._unpublish('camera');
      this._unsubscribeStreams();
    },
    enableLocalAudio: function (enabled) {
      this.options.publishers['camera'].publishAudio(enabled);
    },
    enableLocalVideo: function (enabled) {
      this.options.publishers['camera'].publishVideo(enabled);
    },
    enableRemoteVideo: function (enabled) {
      this.subscriber.subscribeToVideo(enabled);
      this.onEnableRemoteMedia({media: "video", enabled: enabled});
    },
    enableRemoteAudio: function (enabled) {
      this.subscriber.subscribeToAudio(enabled);
      this.onEnableRemoteMedia({media: "audio", enabled: enabled});
    },
    addLog: function(action, variation) {
      _log.call(this, action, variation);
    },
    //private methods
    _publish: function (type) {
      return _publish.call(this, type);
    },
    _unpublish: function (type) {
      _unpublish.call(this, type)
    },
    _initPublisherCamera: function (callback) {
      _initPublisherCamera.call(this, callback);
    },
    _subscribeToStream: function (stream) {
      _subscribeToStream.call(this, stream);
    },
    _unsubscribeStreams: function () {
      _unsubscribeStreams.call(this);
    },
    //handlers
    _handleStart: function (event) {
      _handleStart.call(this, event);
    },
    _handleEnd: function (event) {
      _handleEnd.call(this, event);
    },
    _handleParticipantJoined: function (event) {
      _handleParticipantJoined.call(this, event);
    },
    _handleParticipantLeft: function (event) {
      _handleParticipantLeft.call(this, event);
    },
    _handleLocalPropertyChanged: function (event) {
      _handleLocalPropertyChanged.call(this, event);
    },
    _handleRemotePropertyChanged: function (data) {
      _handleRemotePropertyChanged.call(this, data);
    }
  };

  return CommunicationComponent;

})();
