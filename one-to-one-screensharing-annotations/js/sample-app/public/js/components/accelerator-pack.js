/* global OT AnnotationAccPack ScreenSharingAccPack define */

(function () {

  var _this;
  var _session;
  var _annotation;
  var _screensharing; // eslint-disable-line no-unused-vars

  var _commonOptions = {
    subscribers: [],
    streams: [],
    localCallProperties: {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      showControls: false,
      style: {
        buttonDisplayMode: 'off'
      }
    },
    localScreenProperties: {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      videoSource: 'window',
      showControls: false,
      style: {
        buttonDisplayMode: 'off'
      }
    }
  };

  /**
   * Private methods
   */

  /** Eventing */
  var _events = {}; // {eventName: [callbacks functions . . .]}
  var _isRegisteredEvent = _.partial(_.has, _events);

  /**
   * Register events that can be listened to be other components/modules
   * @param {array | string} events - A list of event names. A single event may
   * also be passed as a string.
   * @returns {function} See triggerEvent
   */
  var registerEvents = function (events) {

    var eventList = Array.isArray(events) ? events : [events];

    _.each(eventList, function (event) {
      if (!_isRegisteredEvent(event)) {
        _events[event] = [];
      }
    });

  };

  /**
   * Register an event listener with the AP layer
   * @param {string} event - The name of the event
   * @param {function} callback - The function invoked upon the event
   */
  var registerEventListener = function (event, callback) {

    if (typeof callback !== 'function') {
      throw new Error('Provided callback is not a function');
    }

    if (!_isRegisteredEvent(event)) {
      registerEvents(event);
    }

    _events[event].push(callback);
  };

  /**
   * Stop a callback from being fired when an event is triggered
   * @param {string} event - The name of the event
   * @param {function} callback - The function invoked upon the event
   */
  var removeEventListener = function (event, callback) {

    if (typeof callback !== 'function') {
      throw new Error('Provided callback is not a function');
    }

    var listeners = _events[event];

    if (!listeners || !listeners.length) {
      return;
    }

    var index = listeners.indexOf(callback);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

  };

  /**
   * Fire all registered callbacks for a given event
   * @param {string} event - The event name
   * @param {*} data - Data to be passed to the callback functions
   */
  var triggerEvent = function (event, data) {
    if (_.has(_events, event)) {
      _.each(_events[event], function (fn) {
        fn(data);
      });
    }
  };

  /**
   * @param [string] type - A subset of common options
   */
  var getOptions = function (type) {

    return type ? _commonOptions[type] : _commonOptions;

  };

  var _validateOptions = function (options) {

    var requiredProps = ['sessionId', 'apiKey', 'token'];

    _.each(requiredProps, function (prop) {
      if (!_.property(prop)(options)) {
        throw new Error('Accelerator Pack requires a session ID, apiKey, and token');
      }
    });

    return options;
  };

  /**
   * Returns the current session
   */
  var getSession = function () {
    return _session;
  };

  /**
   * Initialize the annotation component for use in external window
   * @returns {Promise} < Resolve: [Object] External annotation window >
   */
  var setupExternalAnnotation = function () {
    return _annotation.start(_session, {
      screensharing: true
    });
  };

  /**
   * Initialize the annotation component for use in external window
   * @returns {Promise} < Resolve: [Object] External annotation window >
   */
  var endExternalAnnotation = function () {
    console.log('who called end external?', endExternalAnnotation.caller);
    return _annotation.end();
  };

  /**
   * Initialize the annotation component for use in current window
   * @returns {Promise} < Resolve: [Object] External annotation window >
   */
  var setupAnnotationView = function (subscriber) {
    var canvasContainer = document.getElementById('videoHolderSharedScreen');
    var videoContainer = document.getElementById('videoContainer');
    var annotationOptions = {
      canvasContainer: canvasContainer
    };
    _annotation.start(_session, annotationOptions)
      .then(function () {
        var mainContainer = document.getElementById('main');
        mainContainer.classList.add('aspect-ratio');
        _annotation.linkCanvas(subscriber, canvasContainer, {
          absoluteParent: videoContainer
        });
        _annotation.resizeCanvas();
      });
  };

  /**
   * Initialize the annotation component for use in current window
   * @returns {Promise} < Resolve: [Object] External annotation window >
   */
  var endAnnotationView = function () {
    console.log('who called end view?', endAnnotationView.caller);
    _annotation.end();
    var mainContainer = document.getElementById('main');
    mainContainer.classList.remove('aspect-ratio');
  };

  /**
   * Connect the annotation canvas to the publisher or subscriber
   * @param {Object} pubSub - The publisher or subscriber
   * @param {Object} annotationContainer
   * @param [Object] externalWindow
   *
   */
  var linkAnnotation = function (pubSub, annotationContainer, externalWindow) {
    _annotation.linkCanvas(pubSub, annotationContainer, {
      externalWindow: externalWindow
    });
  };

  var _registerSessionEvents = function () {

    registerEvents(['streamCreated', 'streamDestroyed', 'sessionError']);

    _session.on({
      streamCreated: function (event) {
        triggerEvent('streamCreated', event);
      },
      streamDestroyed: function (event) {
        triggerEvent('streamDestroyed', event);
      }
    });
  };


  var _setupEventListeners = function () {
    registerEventListener('startViewingSharedScreen', setupAnnotationView);
    registerEventListener('endViewingSharedScreen', endAnnotationView);
    registerEventListener('endScreenSharing', endExternalAnnotation);
  };

  /**
   * Initialize any of the accelerator pack components included in the application.
   */
  var _initAccPackComponents = _.once(function () {

    if (!!ScreenSharingAccPack) {

      var screensharingProps = [
        'sessionId',
        'annotation',
        'extensionURL',
        'extensionID',
        'extensionPathFF',
        'screensharingContainer'
      ];

      var screensharingOptions = _.extend(_.pick(_this.options, screensharingProps),
        _this.options.screensharing, {
          session: _session,
          accPack: _this,
          localScreenProperties: _commonOptions.localScreenProperties
        });

      _screensharing = new ScreenSharingAccPack(screensharingOptions);
    }

    if (!!AnnotationAccPack) {

      _annotation = new AnnotationAccPack(_.extend({}, _this.options, {
        accPack: _this
      }));
    }

    _setupEventListeners();

  });

  /**
   * @constructor
   * Provides a common layer for logic and API for accelerator pack components
   */
  var AcceleratorPack = function (options) {

    _this = this;
    _this.options = _validateOptions(options);

    _session = OT.initSession(options.apiKey, options.sessionId);
    _registerSessionEvents();

    // Connect
    _session.connect(options.token, function (error) {
      if (error) {
        triggerEvent('sessionError', error);
      }

    });

    registerEventListener('startCall', _initAccPackComponents);

  };

  AcceleratorPack.prototype = {
    constructor: AcceleratorPack,
    registerEvents: registerEvents,
    triggerEvent: triggerEvent,
    registerEventListener: registerEventListener,
    removeEventListener: removeEventListener,
    getSession: getSession,
    getOptions: getOptions,
    setupAnnotationView: setupAnnotationView,
    setupExternalAnnotation: setupExternalAnnotation,
    linkAnnotation: linkAnnotation
  };

  if (typeof exports === 'object') {
    module.exports = AcceleratorPack;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return AcceleratorPack;
    });
  } else {
    this.AcceleratorPack = AcceleratorPack;
  }

}.call(this));
