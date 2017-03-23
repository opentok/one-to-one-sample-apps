(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function _classCallCheck(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var _this=this,_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},_createClass=function(){function n(n,e){for(var t=0;t<e.length;t++){var o=e[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(n,o.key,o)}}return function(e,t,o){return t&&n(e.prototype,t),o&&n(e,o),e}}();!function(){var n=function(n,e,t){var o="",r=void 0;t&&(r=new Date,r.setTime(r.getTime()+24*t*60*60*1e3),o=["; expires=",r.toGMTString()].join(""));var i=[n,"=",e,o,"; path=/"].join("");return document.cookie=i,e},e=function(n){for(var e=n+"=",t=document.cookie.split(";"),o=void 0,r=0;r<t.length;r++){for(o=t[r];" "===o.charAt(0);)o=o.substring(1,o.length);if(0===o.indexOf(e))return o.substring(e.length,o.length)}return null},t=function(){for(var n=[],e="0123456789abcdef",t=0;t<36;t++)n.push(e.substr(Math.floor(16*Math.random()),1));return n[14]="4",n[19]=e.substr(3&n[19]|8,1),n[8]=n[13]=n[18]=n[23]="-",n.join("")},o=function(o){return e(o)||n(o,t(),7)},r=function(n){if(!n.clientVersion)throw console.log("Error. The clientVersion field cannot be null in the log entry"),new Error("The clientVersion field cannot be null in the log entry");if(!n.source)throw console.log("Error. The source field cannot be null in the log entry"),new Error("The source field cannot be null in the log entry");if(!n.componentId)throw console.log("Error. The componentId field cannot be null in the log entry"),new Error("The componentId field cannot be null in the log entry");if(!n.name)throw console.log("Error. The name field cannot be null in the log entry"),new Error("The guid field cannot be null in the log entry");var e=n.logVersion||"2",t=n.clientSystemTime||(new Date).getTime();return Object.assign({},n,{logVersion:e,clientSystemTime:t})},i=function(n){var e=r(n),t="https://hlg.tokbox.com/prod/logging/ClientEvent",o=new XMLHttpRequest;o.open("POST",t,!0),o.setRequestHeader("Content-type","application/json"),o.send(JSON.stringify(e))},l=function(){function n(e){_classCallCheck(this,n),this.analyticsData=e,this.analyticsData.guid=o(e.name)}return _createClass(n,[{key:"addSessionInfo",value:function(n){if(!n.sessionId)throw console.log("Error. The sessionId field cannot be null in the log entry"),new Error("The sessionId field cannot be null in the log entry");if(this.analyticsData.sessionId=n.sessionId,!n.connectionId)throw console.log("Error. The connectionId field cannot be null in the log entry"),new Error("The connectionId field cannot be null in the log entry");if(this.analyticsData.connectionId=n.connectionId,0===n.partnerId)throw console.log("Error. The partnerId field cannot be null in the log entry"),new Error("The partnerId field cannot be null in the log entry");this.analyticsData.partnerId=n.partnerId}},{key:"logEvent",value:function(n){this.analyticsData.action=n.action,this.analyticsData.variation=n.variation,this.analyticsData.clientSystemTime=(new Date).getTime(),i(this.analyticsData)}}]),n}();"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):_this.OTKAnalytics=l}(this);
},{}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* global OT */

/** Dependencies */
var state = require('./state');

var _require = require('./errors'),
    CoreError = _require.CoreError;

var _require2 = require('./util'),
    dom = _require2.dom,
    path = _require2.path,
    pathOr = _require2.pathOr,
    properCase = _require2.properCase;

var _require3 = require('./logging'),
    message = _require3.message,
    logAnalytics = _require3.logAnalytics,
    logAction = _require3.logAction,
    logVariation = _require3.logVariation;

/** Module variables */


var session = void 0;
var accPack = void 0;
var callProperties = void 0;
var screenProperties = void 0;
var streamContainers = void 0;
var autoSubscribe = void 0;
var connectionLimit = void 0;
var active = false;

/**
 * Default UI propties
 * https://tokbox.com/developer/guides/customize-ui/js/
 */
var defaultCallProperties = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  showControls: false,
  style: {
    buttonDisplayMode: 'off'
  }
};

/**
 * Trigger an event through the API layer
 * @param {String} event - The name of the event
 * @param {*} [data]
 */
var triggerEvent = function triggerEvent(event, data) {
  return accPack.triggerEvent(event, data);
};

/**
 * Determine whether or not the party is able to join the call based on
 * the specified connection limit, if any.
 * @return {Boolean}
 */
var ableToJoin = function ableToJoin() {
  if (!connectionLimit) {
    return true;
  }
  // Not using the session here since we're concerned with number of active publishers
  var connections = Object.values(state.getStreams()).filter(function (s) {
    return s.videoType === 'camera';
  });
  return connections.length < connectionLimit;
};

/**
 * Create a camera publisher object
 * @param {Object} publisherProperties
 * @returns {Promise} <resolve: Object, reject: Error>
 */
var createPublisher = function createPublisher(publisherProperties) {
  return new Promise(function (resolve, reject) {
    // TODO: Handle adding 'name' option to props
    var props = Object.assign({}, callProperties, publisherProperties);
    // TODO: Figure out how to handle common vs package-specific options
    // ^^^ This may already be available through package options
    var container = dom.element(streamContainers('publisher', 'camera'));
    var publisher = OT.initPublisher(container, props, function (error) {
      error ? reject(error) : resolve(publisher);
    });
  });
};

/**
 * Publish the local camera stream and update state
 * @param {Object} publisherProperties
 * @returns {Promise} <resolve: empty, reject: Error>
 */
var publish = function publish(publisherProperties) {
  return new Promise(function (resolve, reject) {
    var onPublish = function onPublish(publisher) {
      return function (error) {
        if (error) {
          reject(error);
          logAnalytics(logAction.startCall, logVariation.fail);
        } else {
          logAnalytics(logAction.startCall, logVariation.success);
          state.addPublisher('camera', publisher);
          resolve(publisher);
        }
      };
    };

    var publishToSession = function publishToSession(publisher) {
      return session.publish(publisher, onPublish(publisher));
    };

    var handleError = function handleError(error) {
      logAnalytics(logAction.startCall, logVariation.fail);
      var errorMessage = error.code === 1010 ? 'Check your network connection' : error.message;
      triggerEvent('error', errorMessage);
      reject(error);
    };

    createPublisher(publisherProperties).then(publishToSession).catch(handleError);
  });
};

/**
 * Subscribe to a stream and update the state
 * @param {Object} stream - An OpenTok stream object
 * @returns {Promise} <resolve: empty reject: Error >
 */
var subscribe = function subscribe(stream) {
  return new Promise(function (resolve, reject) {
    logAnalytics(logAction.subscribe, logVariation.attempt);
    var streamMap = state.getStreamMap();
    if (streamMap[stream.id]) {
      // Are we already subscribing to the stream?
      resolve();
    } else {
      (function () {
        // No videoType indicates SIP https://tokbox.com/developer/guides/sip/
        var type = pathOr('sip', 'videoType', stream);
        var connectionData = JSON.parse(path(['connection', 'data'], stream) || null);
        var container = dom.query(streamContainers('subscriber', type, connectionData));
        var options = type === 'camera' ? callProperties : screenProperties;
        var subscriber = session.subscribe(stream, container, options, function (error) {
          if (error) {
            logAnalytics(logAction.subscribe, logVariation.fail);
            reject(error);
          } else {
            state.addSubscriber(subscriber);
            triggerEvent('subscribeTo' + properCase(type), Object.assign({}, { subscriber: subscriber }, state.all()));
            type === 'screen' && triggerEvent('startViewingSharedScreen', subscriber); // Legacy event
            logAnalytics(logAction.subscribe, logVariation.success);
            resolve();
          }
        });
      })();
    }
  });
};

/**
 * Unsubscribe from a stream and update the state
 * @param {Object} subscriber - An OpenTok subscriber object
 * @returns {Promise} <resolve: empty>
 */
var unsubscribe = function unsubscribe(subscriber) {
  return new Promise(function (resolve) {
    logAnalytics(logAction.unsubscribe, logVariation.attempt);
    var type = path('stream.videoType', subscriber);
    state.removeSubscriber(type, subscriber);
    session.unsubscribe(subscriber);
    logAnalytics(logAction.unsubscribe, logVariation.success);
    resolve();
  });
};

/**
 * Ensure all required options are received
 * @param {Object} options
 */
var validateOptions = function validateOptions(options) {
  var requiredOptions = ['accPack'];
  requiredOptions.forEach(function (option) {
    if (!options[option]) {
      throw new CoreError(option + ' is a required option.', 'invalidParameters');
    }
  });

  accPack = options.accPack;
  streamContainers = options.streamContainers;
  callProperties = options.callProperties || defaultCallProperties;
  connectionLimit = options.connectionLimit || null;
  autoSubscribe = options.hasOwnProperty('autoSubscribe') ? options.autoSubscribe : true;

  screenProperties = options.screenProperties || Object.assign({}, defaultCallProperties, { videoSource: 'window' });
};

/**
 * Set session in module scope
 */
var setSession = function setSession() {
  session = state.getSession();
};

/**
 * Subscribe to new stream unless autoSubscribe is set to false
 * @param {Object} stream
 */
var onStreamCreated = function onStreamCreated(_ref) {
  var stream = _ref.stream;
  return active && autoSubscribe && subscribe(stream);
};

/**
 * Update state and trigger corresponding event(s) when stream is destroyed
 * @param {Object} stream
 */
var onStreamDestroyed = function onStreamDestroyed(_ref2) {
  var stream = _ref2.stream;

  state.removeStream(stream);
  var type = pathOr('sip', 'videoType', stream);
  type === 'screen' && triggerEvent('endViewingSharedScreen'); // Legacy event
  triggerEvent('unsubscribeFrom' + properCase(type), state.getPubSub());
};

/**
 * Listen for API-level events
 */
var createEventListeners = function createEventListeners() {
  accPack.on('streamCreated', onStreamCreated);
  accPack.on('streamDestroyed', onStreamDestroyed);
};

/**
 * Start publishing the local camera feed and subscribing to streams in the session
 * @param {Object} publisherProperties
 * @returns {Promise} <resolve: Object, reject: Error>
 */
var startCall = function startCall(publisherProperties) {
  return new Promise(function (resolve, reject) {
    // eslint-disable-line consistent-return
    logAnalytics(logAction.startCall, logVariation.attempt);

    /**
     * Determine if we're able to join the session based on an existing connection limit
     */
    if (!ableToJoin()) {
      var errorMessage = 'Session has reached its connection limit';
      triggerEvent('error', errorMessage);
      logAnalytics(logAction.startCall, logVariation.fail);
      return reject(new CoreError(errorMessage, 'connectionLimit'));
    }

    /**
     * Subscribe to any streams that existed before we start the call from our side.
     */
    var subscribeToInitialStreams = function subscribeToInitialStreams(publisher) {
      // Get an array of initial subscription promises
      var initialSubscriptions = function initialSubscriptions() {
        if (autoSubscribe) {
          var _ret2 = function () {
            var streams = state.getStreams();
            return {
              v: Object.keys(streams).map(function (id) {
                return subscribe(streams[id]);
              })
            };
          }();

          if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
        }
        return [Promise.resolve()];
      };

      // Handle success
      var onSubscribeToAll = function onSubscribeToAll() {
        var pubSubData = Object.assign({}, state.getPubSub(), { publisher: publisher });
        triggerEvent('startCall', pubSubData);
        active = true;
        resolve(pubSubData);
      };

      // Handle error
      var onError = function onError(reason) {
        message('Failed to subscribe to all existing streams: ' + reason);
        // We do not reject here in case we still successfully publish to the session
        resolve(Object.assign({}, state.getPubSub(), { publisher: publisher }));
      };

      Promise.all(initialSubscriptions()).then(onSubscribeToAll).catch(onError);
    };

    publish(publisherProperties).then(subscribeToInitialStreams).catch(reject);
  });
};

/**
 * Stop publishing and unsubscribe from all streams
 */
var endCall = function endCall() {
  logAnalytics(logAction.endCall, logVariation.attempt);

  var _state$getPubSub = state.getPubSub(),
      publishers = _state$getPubSub.publishers,
      subscribers = _state$getPubSub.subscribers;

  var unpublish = function unpublish(publisher) {
    return session.unpublish(publisher);
  };
  Object.values(publishers.camera).forEach(unpublish);
  Object.values(publishers.screen).forEach(unpublish);
  // TODO Promise.all for unsubsribing
  Object.values(subscribers.camera).forEach(unsubscribe);
  Object.values(subscribers.screen).forEach(unsubscribe);
  state.removeAllPublishers();
  active = false;
  triggerEvent('endCall');
  logAnalytics(logAction.endCall, logVariation.success);
};

/**
 * Enable/disable local audio or video
 * @param {String} source - 'audio' or 'video'
 * @param {Boolean} enable
 */
var enableLocalAV = function enableLocalAV(id, source, enable) {
  var method = 'publish' + properCase(source);

  var _state$getPubSub2 = state.getPubSub(),
      publishers = _state$getPubSub2.publishers;

  publishers.camera[id][method](enable);
};

/**
 * Enable/disable remote audio or video
 * @param {String} subscriberId
 * @param {String} source - 'audio' or 'video'
 * @param {Boolean} enable
 */
var enableRemoteAV = function enableRemoteAV(subscriberId, source, enable) {
  var method = 'subscribeTo' + properCase(source);

  var _state$getPubSub3 = state.getPubSub(),
      subscribers = _state$getPubSub3.subscribers;

  subscribers.camera[subscriberId][method](enable);
};

/**
 * Initialize the communication component
 * @param {Object} options
 * @param {Object} options.accPack
 * @param {Number} options.connectionLimit
 * @param {Function} options.streamContainer
 */
var init = function init(options) {
  return new Promise(function (resolve) {
    validateOptions(options);
    setSession();
    createEventListeners();
    resolve();
  });
};

/** Exports */
module.exports = {
  init: init,
  startCall: startCall,
  endCall: endCall,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  enableLocalAV: enableLocalAV,
  enableRemoteAV: enableRemoteAV
};

},{"./errors":4,"./logging":6,"./state":10,"./util":11}],3:[function(require,module,exports){
(function (global){
'use strict';

var _arguments = arguments;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* global OT */
/**
 * Dependencies
 */
var util = require('./util');
var internalState = require('./state');
var accPackEvents = require('./events');
var communication = require('./communication');
var OpenTokSDK = require('./sdk-wrapper/sdkWrapper');

var _require = require('./errors'),
    CoreError = _require.CoreError;

var _require2 = require('./logging'),
    message = _require2.message,
    initLogAnalytics = _require2.initLogAnalytics,
    logAnalytics = _require2.logAnalytics,
    logAction = _require2.logAction,
    logVariation = _require2.logVariation,
    updateLogAnalytics = _require2.updateLogAnalytics;

/**
 * Helper methods
 */


var dom = util.dom,
    path = util.path,
    pathOr = util.pathOr,
    properCase = util.properCase;

/**
 * Individual Accelerator Packs
 */

var textChat = void 0; // eslint-disable-line no-unused-vars
var screenSharing = void 0; // eslint-disable-line no-unused-vars
var annotation = void 0;
var archiving = void 0; // eslint-disable-line no-unused-vars

/**
 * Get access to an accelerator pack
 * @param {String} packageName - textChat, screenSharing, annotation, or archiving
 * @returns {Object} The instance of the accelerator pack
 */
var getAccPack = function getAccPack(packageName) {
  logAnalytics(logAction.getAccPack, logVariation.attempt);
  var packages = {
    textChat: textChat,
    screenSharing: screenSharing,
    annotation: annotation,
    archiving: archiving
  };
  logAnalytics(logAction.getAccPack, logVariation.success);
  return packages[packageName];
};

/** Eventing */

var eventListeners = {};

/**
 * Register events that can be listened to be other components/modules
 * @param {array | string} events - A list of event names. A single event may
 * also be passed as a string.
 */
var registerEvents = function registerEvents(events) {
  var eventList = Array.isArray(events) ? events : [events];
  eventList.forEach(function (event) {
    if (!eventListeners[event]) {
      eventListeners[event] = new Set();
    }
  });
};

/**
 * Register a callback for a specific event or pass an object with
 * with event => callback key/value pairs to register listeners for
 * multiple events.
 * @param {String | Object} event - The name of the event
 * @param {Function} callback
 */
var on = function on(event, callback) {
  // logAnalytics(logAction.on, logVariation.attempt);
  if ((typeof event === 'undefined' ? 'undefined' : _typeof(event)) === 'object') {
    Object.keys(event).forEach(function (eventName) {
      on(eventName, event[eventName]);
    });
    return;
  }
  var eventCallbacks = eventListeners[event];
  if (!eventCallbacks) {
    message(event + ' is not a registered event.');
    // logAnalytics(logAction.on, logVariation.fail);
  } else {
    eventCallbacks.add(callback);
    // logAnalytics(logAction.on, logVariation.success);
  }
};

/**
 * Remove a callback for a specific event.  If no parameters are passed,
 * all event listeners will be removed.
 * @param {String} event - The name of the event
 * @param {Function} callback
 */
var off = function off(event, callback) {
  // logAnalytics(logAction.off, logVariation.attempt);
  if (_arguments.lenth === 0) {
    Object.keys(eventListeners).forEach(function (eventType) {
      eventListeners[eventType].clear();
    });
  }
  var eventCallbacks = eventListeners[event];
  if (!eventCallbacks) {
    // logAnalytics(logAction.off, logVariation.fail);
    message(event + ' is not a registered event.');
  } else {
    eventCallbacks.delete(callback);
    // logAnalytics(logAction.off, logVariation.success);
  }
};

/**
 * Trigger an event and fire all registered callbacks
 * @param {String} event - The name of the event
 * @param {*} data - Data to be passed to callback functions
 */
var triggerEvent = function triggerEvent(event, data) {
  var eventCallbacks = eventListeners[event];
  if (!eventCallbacks) {
    registerEvents(event);
    message(event + ' has been registered as a new event.');
  } else {
    eventCallbacks.forEach(function (callback) {
      return callback(data, event);
    });
  }
};

/**
 * Get the current OpenTok session object
 * @returns {Object}
 */
var getSession = internalState.getSession;

/**
 * Returns the current OpenTok session credentials
 * @returns {Object}
 */
var getCredentials = internalState.getCredentials;

/**
 * Returns the options used for initialization
 * @returns {Object}
 */
var getOptions = internalState.getOptions;

var createEventListeners = function createEventListeners(session, options) {
  Object.keys(accPackEvents).forEach(function (type) {
    return registerEvents(accPackEvents[type]);
  });

  /**
   * If using screen sharing + annotation in an external window, the screen sharing
   * package will take care of calling annotation.start() and annotation.linkCanvas()
   */
  var usingAnnotation = path('screenSharing.annotation', options);
  var internalAnnotation = usingAnnotation && !path('screenSharing.externalWindow', options);

  /**
   * Wrap session events and update internalState when streams are created
   * or destroyed
   */
  accPackEvents.session.forEach(function (eventName) {
    session.on(eventName, function (event) {
      if (eventName === 'streamCreated') {
        internalState.addStream(event.stream);
      }
      if (eventName === 'streamDestroyed') {
        internalState.removeStream(event.stream);
      }
      triggerEvent(eventName, event);
    });
  });

  if (usingAnnotation) {
    on('subscribeToScreen', function (_ref) {
      var subscriber = _ref.subscriber;

      annotation.start(getSession()).then(function () {
        var absoluteParent = dom.query(path('annotation.absoluteParent.subscriber', options));
        var linkOptions = absoluteParent ? { absoluteParent: absoluteParent } : null;
        annotation.linkCanvas(subscriber, subscriber.element.parentElement, linkOptions);
      });
    });

    on('unsubscribeFromScreen', function () {
      annotation.end();
    });
  }

  on('startScreenSharing', function (publisher) {
    internalState.addPublisher('screen', publisher);
    triggerEvent('startScreenShare', Object.assign({}, { publisher: publisher }, internalState.getPubSub()));
    if (internalAnnotation) {
      annotation.start(getSession()).then(function () {
        var absoluteParent = dom.query(path('annotation.absoluteParent.publisher', options));
        var linkOptions = absoluteParent ? { absoluteParent: absoluteParent } : null;
        annotation.linkCanvas(publisher, publisher.element.parentElement, linkOptions);
      });
    }
  });

  on('endScreenSharing', function (publisher) {
    // delete publishers.screen[publisher.id];
    internalState.removePublisher('screen', publisher);
    triggerEvent('endScreenShare', internalState.getPubSub());
    if (internalAnnotation) {
      annotation.end();
    }
  });
};

var setupExternalAnnotation = function setupExternalAnnotation() {
  return annotation.start(getSession(), {
    screensharing: true
  });
};

var linkAnnotation = function linkAnnotation(pubSub, annotationContainer, externalWindow) {
  annotation.linkCanvas(pubSub, annotationContainer, {
    externalWindow: externalWindow
  });

  if (externalWindow) {
    (function () {
      // Add subscribers to the external window
      var streams = internalState.getStreams();
      var cameraStreams = Object.keys(streams).reduce(function (acc, streamId) {
        var stream = streams[streamId];
        return stream.videoType === 'camera' ? acc.concat(stream) : acc;
      }, []);
      cameraStreams.forEach(annotation.addSubscriberToExternalWindow);
    })();
  }
};

var initPackages = function initPackages() {
  logAnalytics(logAction.initPackages, logVariation.attempt);
  var session = getSession();
  var options = getOptions();
  /**
   * Try to require a package.  If 'require' is unavailable, look for
   * the package in global scope.  A switch internalStatement is used because
   * webpack and Browserify aren't able to resolve require internalStatements
   * that use variable names.
   * @param {String} packageName - The name of the npm package
   * @param {String} globalName - The name of the package if exposed on global/window
   * @returns {Object}
   */
  var optionalRequire = function optionalRequire(packageName, globalName) {
    var result = void 0;
    /* eslint-disable global-require, import/no-extraneous-dependencies, import/no-unresolved */
    try {
      switch (packageName) {
        case 'opentok-text-chat':
          result = require('opentok-text-chat');
          break;
        case 'opentok-screen-sharing':
          result = require('opentok-screen-sharing');
          break;
        case 'opentok-annotation':
          result = require('opentok-annotation');
          break;
        case 'opentok-archiving':
          result = require('opentok-archiving');
          break;
        default:
          break;
      }
      /* eslint-enable global-require */
    } catch (error) {
      result = window[globalName];
    }
    if (!result) {
      logAnalytics(logAction.initPackages, logVariation.fail);
      throw new CoreError('Could not load ' + packageName, 'missingDependency');
    }
    return result;
  };

  var availablePackages = {
    textChat: function textChat() {
      return optionalRequire('opentok-text-chat', 'TextChatAccPack');
    },
    screenSharing: function screenSharing() {
      return optionalRequire('opentok-screen-sharing', 'ScreenSharingAccPack');
    },
    annotation: function annotation() {
      return optionalRequire('opentok-annotation', 'AnnotationAccPack');
    },
    archiving: function archiving() {
      return optionalRequire('opentok-archiving', 'ArchivingAccPack');
    }
  };

  var packages = {};
  (path('packages', options) || []).forEach(function (acceleratorPack) {
    if (availablePackages[acceleratorPack]) {
      // eslint-disable-next-line no-param-reassign
      packages[properCase(acceleratorPack)] = availablePackages[acceleratorPack]();
    } else {
      message(acceleratorPack + ' is not a valid accelerator pack');
    }
  });

  /**
   * Get containers for streams, controls, and the chat widget
   */
  var getDefaultContainer = function getDefaultContainer(pubSub) {
    return document.getElementById(pubSub + 'Container');
  };
  var getContainerElements = function getContainerElements() {
    // Need to use path to check for null values
    var controls = pathOr('#videoControls', 'controlsContainer', options);
    var chat = pathOr('#chat', 'textChat.container', options);
    var stream = pathOr(getDefaultContainer, 'streamContainers', options);
    return { stream: stream, controls: controls, chat: chat };
  };
  /** *** *** *** *** */

  /**
   * Return options for the specified package
   * @param {String} packageName
   * @returns {Object}
   */
  var packageOptions = function packageOptions(packageName) {
    /**
     * Methods to expose to accelerator packs
     */
    var accPack = {
      registerEventListener: on, // Legacy option
      on: on,
      registerEvents: registerEvents,
      triggerEvent: triggerEvent,
      setupExternalAnnotation: setupExternalAnnotation,
      linkAnnotation: linkAnnotation
    };

    /**
     * If options.controlsContainer/containers.controls is null,
     * accelerator packs should not append their controls.
     */
    var containers = getContainerElements();
    var appendControl = !!containers.controls;
    var controlsContainer = containers.controls; // Legacy option
    var streamContainers = containers.stream;
    var baseOptions = { session: session, accPack: accPack, controlsContainer: controlsContainer, appendControl: appendControl, streamContainers: streamContainers };

    switch (packageName) {
      /* beautify ignore:start */
      case 'communication':
        {
          return Object.assign({}, baseOptions, options.communication);
        }
      case 'textChat':
        {
          var textChatOptions = {
            textChatContainer: options.textChat.container,
            waitingMessage: options.textChat.waitingMessage,
            sender: { alias: options.textChat.name }
          };
          return Object.assign({}, baseOptions, textChatOptions);
        }
      case 'screenSharing':
        {
          var screenSharingContainer = { screenSharingContainer: streamContainers };
          return Object.assign({}, baseOptions, screenSharingContainer, options.screenSharing);
        }
      case 'annotation':
        {
          return Object.assign({}, baseOptions, options.annotation);
        }
      case 'archiving':
        {
          return Object.assign({}, baseOptions, options.archiving);
        }
      default:
        return {};
      /* beautify ignore:end */
    }
  };

  /** Create instances of each package */
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  communication.init(packageOptions('communication'));
  textChat = packages.TextChat ? new packages.TextChat(packageOptions('textChat')) : null;
  screenSharing = packages.ScreenSharing ? new packages.ScreenSharing(packageOptions('screenSharing')) : null;
  annotation = packages.Annotation ? new packages.Annotation(packageOptions('annotation')) : null;
  archiving = packages.Archiving ? new packages.Archiving(packageOptions('archiving')) : null;

  logAnalytics(logAction.initPackages, logVariation.success);
};

/**
 * Ensures that we have the required credentials
 * @param {Object} credentials
 * @param {String} credentials.apiKey
 * @param {String} credentials.sessionId
 * @param {String} credentials.token
 */
var validateCredentials = function validateCredentials() {
  var credentials = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var required = ['apiKey', 'sessionId', 'token'];
  required.forEach(function (credential) {
    if (!credentials[credential]) {
      throw new CoreError(credential + ' is a required credential', 'invalidParameters');
    }
  });
};

/**
 * Connect to the session
 * @returns {Promise} <resolve: -, reject: Error>
 */
var connect = function connect() {
  return new Promise(function (resolve, reject) {
    logAnalytics(logAction.connect, logVariation.attempt);
    var session = getSession();

    var _getCredentials = getCredentials(),
        token = _getCredentials.token;

    session.connect(token, function (error) {
      if (error) {
        message(error);
        logAnalytics(logAction.connect, logVariation.fail);
        return reject(error);
      }
      var sessionId = session.sessionId,
          apiKey = session.apiKey;

      updateLogAnalytics(sessionId, path('connection.connectionId', session), apiKey);
      logAnalytics(logAction.connect, logVariation.success);
      initPackages();
      triggerEvent('connected', session);
      return resolve({ connections: session.connections.length() });
    });
  });
};

/**
 * Disconnect from the session
 * @returns {Promise} <resolve: -, reject: Error>
 */
var disconnect = function disconnect() {
  logAnalytics(logAction.disconnect, logVariation.attempt);
  getSession().disconnect();
  internalState.reset();
  logAnalytics(logAction.disconnect, logVariation.success);
};

/**
 * Force a remote connection to leave the session
 * @param {Object} connection
 * @returns {Promise} <resolve: empty, reject: Error>
 */
var forceDisconnect = function forceDisconnect(connection) {
  return new Promise(function (resolve, reject) {
    logAnalytics(logAction.forceDisconnect, logVariation.attempt);
    getSession().forceDisconnect(connection, function (error) {
      if (error) {
        logAnalytics(logAction.forceDisconnect, logVariation.fail);
        reject(error);
      } else {
        logAnalytics(logAction.forceDisconnect, logVariation.success);
        resolve();
      }
    });
  });
};

/**
 * Force the publisher of a stream to stop publishing the stream
 * @param {Object} stream
 * @returns {Promise} <resolve: empty, reject: Error>
 */
var forceUnpublish = function forceUnpublish(stream) {
  return new Promise(function (resolve, reject) {
    logAnalytics(logAction.forceUnpublish, logVariation.attempt);
    getSession().forceUnpublish(stream, function (error) {
      if (error) {
        logAnalytics(logAction.forceUnpublish, logVariation.fail);
        reject(error);
      } else {
        logAnalytics(logAction.forceUnpublish, logVariation.success);
        resolve();
      }
    });
  });
};

/**
 * Get the local publisher object for a stream
 * @param {Object} stream - An OpenTok stream object
 * @returns {Object} - The publisher object
 */
var getPublisherForStream = function getPublisherForStream(stream) {
  return getSession().getPublisherForStream(stream);
};

/**
 * Get the local subscriber objects for a stream
 * @param {Object} stream - An OpenTok stream object
 * @returns {Array} - An array of subscriber object
 */
var getSubscribersForStream = function getSubscribersForStream(stream) {
  return getSession().getSubscribersForStream(stream);
};

/**
 * Send a signal using the OpenTok signaling apiKey
 * @param {String} type
 * @param {*} [data]
 * @param {Object} to - An OpenTok connection object
 * @returns {Promise} <resolve: empty, reject: Error>
 */
var signal = function signal(type, signalData, to) {
  return new Promise(function (resolve, reject) {
    logAnalytics(logAction.signal, logVariation.attempt);
    var session = getSession();
    var data = JSON.stringify(signalData);
    var signalObj = to ? { type: type, data: data, to: to } : { type: type, data: data };
    session.signal(signalObj, function (error) {
      if (error) {
        logAnalytics(logAction.signal, logVariation.fail);
        reject(error);
      } else {
        logAnalytics(logAction.signal, logVariation.success);
        resolve();
      }
    });
  });
};

/**
 * Enable or disable local audio
 * @param {Boolean} enable
 */
var toggleLocalAudio = function toggleLocalAudio(enable) {
  logAnalytics(logAction.toggleLocalAudio, logVariation.attempt);

  var _internalState$getPub = internalState.getPubSub(),
      publishers = _internalState$getPub.publishers;

  var toggleAudio = function toggleAudio(id) {
    return communication.enableLocalAV(id, 'audio', enable);
  };
  Object.keys(publishers.camera).forEach(toggleAudio);
  logAnalytics(logAction.toggleLocalAudio, logVariation.success);
};

/**
 * Enable or disable local video
 * @param {Boolean} enable
 */
var toggleLocalVideo = function toggleLocalVideo(enable) {
  logAnalytics(logAction.toggleLocalVideo, logVariation.attempt);

  var _internalState$getPub2 = internalState.getPubSub(),
      publishers = _internalState$getPub2.publishers;

  var toggleVideo = function toggleVideo(id) {
    return communication.enableLocalAV(id, 'video', enable);
  };
  Object.keys(publishers.camera).forEach(toggleVideo);
  logAnalytics(logAction.toggleLocalVideo, logVariation.success);
};

/**
 * Enable or disable remote audio
 * @param {String} id - Subscriber id
 * @param {Boolean} enable
 */
var toggleRemoteAudio = function toggleRemoteAudio(id, enable) {
  logAnalytics(logAction.toggleRemoteAudio, logVariation.attempt);
  communication.enableRemoteAV(id, 'audio', enable);
  logAnalytics(logAction.toggleRemoteAudio, logVariation.success);
};

/**
 * Enable or disable remote video
 * @param {String} id - Subscriber id
 * @param {Boolean} enable
 */
var toggleRemoteVideo = function toggleRemoteVideo(id, enable) {
  logAnalytics(logAction.toggleRemoteVideo, logVariation.attempt);
  communication.enableRemoteAV(id, 'video', enable);
  logAnalytics(logAction.toggleRemoteVideo, logVariation.success);
};

/**
 * Initialize the accelerator pack
 * @param {Object} options
 * @param {Object} options.credentials
 * @param {Array} [options.packages]
 * @param {Object} [options.containers]
 */
var init = function init(options) {
  if (!options) {
    throw new CoreError('Missing options required for initialization', 'invalidParameters');
  }
  var credentials = options.credentials;

  validateCredentials(options.credentials);

  // Init analytics
  initLogAnalytics(window.location.origin, credentials.sessionId, null, credentials.apiKey);
  logAnalytics(logAction.init, logVariation.attempt);
  var session = OT.initSession(credentials.apiKey, credentials.sessionId);
  createEventListeners(session, options);
  internalState.setSession(session);
  internalState.setCredentials(credentials);
  internalState.setOptions(options);
  logAnalytics(logAction.init, logVariation.success);
};

var opentokCore = {
  init: init,
  connect: connect,
  disconnect: disconnect,
  forceDisconnect: forceDisconnect,
  forceUnpublish: forceUnpublish,
  getAccPack: getAccPack,
  getOptions: getOptions,
  getSession: getSession,
  getPublisherForStream: getPublisherForStream,
  getSubscribersForStream: getSubscribersForStream,
  on: on,
  off: off,
  registerEventListener: on,
  triggerEvent: triggerEvent,
  signal: signal,
  state: internalState.all,
  startCall: communication.startCall,
  endCall: communication.endCall,
  OpenTokSDK: OpenTokSDK,
  toggleLocalAudio: toggleLocalAudio,
  toggleLocalVideo: toggleLocalVideo,
  toggleRemoteAudio: toggleRemoteAudio,
  toggleRemoteVideo: toggleRemoteVideo,
  subscribe: communication.subscribe,
  unsubscribe: communication.unsubscribe,
  util: util
};

if (global === window) {
  window.otCore = opentokCore;
}

module.exports = opentokCore;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./communication":2,"./errors":4,"./events":5,"./logging":6,"./sdk-wrapper/sdkWrapper":8,"./state":10,"./util":11,"opentok-annotation":undefined,"opentok-archiving":undefined,"opentok-screen-sharing":undefined,"opentok-text-chat":undefined}],4:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** Errors */
var CoreError = function (_Error) {
  _inherits(CoreError, _Error);

  function CoreError(errorMessage, errorType) {
    _classCallCheck(this, CoreError);

    var _this = _possibleConstructorReturn(this, (CoreError.__proto__ || Object.getPrototypeOf(CoreError)).call(this, "otAccCore: " + errorMessage));

    _this.type = errorType;
    return _this;
  }

  return CoreError;
}(Error);

module.exports = {
  CoreError: CoreError
};

},{}],5:[function(require,module,exports){
'use strict';

var events = {
  session: ['archiveStarted', 'archiveStopped', 'connectionCreated', 'connectionDestroyed', 'sessionConnected', 'sessionDisconnected', 'sessionReconnected', 'sessionReconnecting', 'signal', 'streamCreated', 'streamDestroyed', 'streamPropertyChanged'],
  core: ['connected', 'startScreenShare', 'endScreenShare', 'error'],
  communication: ['startCall', 'endCall', 'callPropertyChanged', 'subscribeToCamera', 'subscribeToScreen', 'subscribeToSip', 'unsubscribeFromCamera', 'unsubscribeFromScreen', 'startViewingSharedScreen', 'endViewingSharedScreen'],
  textChat: ['showTextChat', 'hideTextChat', 'messageSent', 'errorSendingMessage', 'messageReceived'],
  screenSharing: ['startScreenSharing', 'endScreenSharing', 'screenSharingError'],
  annotation: ['startAnnotation', 'linkAnnotation', 'resizeCanvas', 'annotationWindowClosed', 'endAnnotation'],
  archiving: ['startArchive', 'stopArchive', 'archiveReady', 'archiveError']
};

module.exports = events;

},{}],6:[function(require,module,exports){
'use strict';

var OTKAnalytics = require('opentok-solutions-logging');

// eslint-disable-next-line no-console
var message = function message(messageText) {
  return console.log('otAccCore: ' + messageText);
};

/** Analytics */

var analytics = null;

var logVariation = {
  attempt: 'Attempt',
  success: 'Success',
  fail: 'Fail'
};

var logAction = {
  // vars for the analytics logs. Internal use
  init: 'Init',
  initPackages: 'InitPackages',
  connect: 'ConnectCoreAcc',
  disconnect: 'DisconnectCoreAcc',
  forceDisconnect: 'ForceDisconnectCoreAcc',
  forceUnpublish: 'ForceUnpublishCoreAcc',
  getAccPack: 'GetAccPack',
  signal: 'SignalCoreAcc',
  startCall: 'StartCallCoreAcc',
  endCall: 'EndCallCoreAcc',
  toggleLocalAudio: 'ToggleLocalAudio',
  toggleLocalVideo: 'ToggleLocalVideo',
  toggleRemoteAudio: 'ToggleRemoteAudio',
  toggleRemoteVideo: 'ToggleRemoteVideo',
  subscribe: 'SubscribeCoreAcc',
  unsubscribe: 'UnsubscribeCoreAcc'
};

var updateLogAnalytics = function updateLogAnalytics(sessionId, connectionId, apiKey) {
  if (sessionId && connectionId && apiKey) {
    var sessionInfo = {
      sessionId: sessionId,
      connectionId: connectionId,
      partnerId: apiKey
    };
    analytics.addSessionInfo(sessionInfo);
  }
};

var initLogAnalytics = function initLogAnalytics(source, sessionId, connectionId, apikey) {
  var otkanalyticsData = {
    clientVersion: 'js-vsol-1.0.0',
    source: source,
    componentId: 'coreAccelerator',
    name: 'coreAccelerator',
    partnerId: apikey
  };

  analytics = new OTKAnalytics(otkanalyticsData);

  if (connectionId) {
    updateLogAnalytics(sessionId, connectionId, apikey);
  }
};

var logAnalytics = function logAnalytics(action, variation) {
  analytics.logEvent({ action: action, variation: variation });
};

module.exports = {
  message: message,
  logAction: logAction,
  logVariation: logVariation,
  initLogAnalytics: initLogAnalytics,
  updateLogAnalytics: updateLogAnalytics,
  logAnalytics: logAnalytics
};

},{"opentok-solutions-logging":1}],7:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** Errors */
var SDKError = function (_Error) {
  _inherits(SDKError, _Error);

  function SDKError(errorMessage, errorType) {
    _classCallCheck(this, SDKError);

    var _this = _possibleConstructorReturn(this, (SDKError.__proto__ || Object.getPrototypeOf(SDKError)).call(this, "otSDK: " + errorMessage));

    _this.type = errorType;
    return _this;
  }

  return SDKError;
}(Error);

module.exports = {
  SDKError: SDKError
};

},{}],8:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global OT */

/* Dependencies */
var State = require('./state');

var _require = require('./errors'),
    SDKError = _require.SDKError;

/* Internal variables */

var stateMap = new WeakMap();

/* Internal methods */

/**
 * Ensures that we have the required credentials
 * @param {Object} credentials
 * @param {String} credentials.apiKey
 * @param {String} credentials.sessionId
 * @param {String} credentials.token
 * @returns {Object}
 */
var validateCredentials = function validateCredentials() {
  var credentials = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var required = ['apiKey', 'sessionId', 'token'];
  required.forEach(function (credential) {
    if (!credentials[credential]) {
      throw new SDKError(credential + ' is a required credential', 'invalidParameters');
    }
  });
  return credentials;
};

/**
 * Initialize an OpenTok publisher object
 * @param {String | Object} element - The target element
 * @param {Object} properties - The publisher properties
 * @returns {Promise} <resolve: Object, reject: Error>
 */
var initPublisher = function initPublisher(element, properties) {
  return new Promise(function (resolve, reject) {
    var publisher = OT.initPublisher(element, properties, function (error) {
      error ? reject(error) : resolve(publisher);
    });
  });
};

/**
 * Binds and sets a single event listener on the OpenTok session
 * @param {String} event - The name of the event
 * @param {Function} callback
 */
var bindListener = function bindListener(target, context, event, callback) {
  var paramsError = '\'on\' requires a string and a function to create an event listener.';
  if (typeof event !== 'string' || typeof callback !== 'function') {
    throw new SDKError(paramsError, 'invalidParameters');
  }
  target.on(event, callback.bind(context));
};

/**
 * Bind and set event listeners
 * @param {Object} target - An OpenTok session, publisher, or subscriber object
 * @param {Object} context - The context to which to bind event listeners
 * @param {Object | Array} listeners - An object (or array of objects) with
 *        eventName/callback k/v pairs
 */
var bindListeners = function bindListeners(target, context, listeners) {
  /**
   * Create listeners from an object with event/callback k/v pairs
   * @param {Object} listeners
   */
  var createListenersFromObject = function createListenersFromObject(eventListeners) {
    Object.keys(eventListeners).forEach(function (event) {
      bindListener(target, context, event, eventListeners[event]);
    });
  };

  if (Array.isArray(listeners)) {
    listeners.forEach(function (listener) {
      return createListenersFromObject(listener);
    });
  } else {
    createListenersFromObject(listeners);
  }
};

/**
 * @class
 * Represents an OpenTok SDK Wrapper
 */

var OpenTokSDK = function () {
  /**
   * Create an SDK Wrapper
   * @param {Object} credentials
   * @param {String} credentials.apiKey
   * @param {String} credentials.sessionId
   * @param {String} credentials.token
   */
  function OpenTokSDK(credentials) {
    _classCallCheck(this, OpenTokSDK);

    this.credentials = validateCredentials(credentials);
    stateMap.set(this, new State());
    this.session = OT.initSession(credentials.apiKey, credentials.sessionId);
    this.setInternalListeners();
  }

  /**
   * Determines if a connection object is my local connection
   * @param {Object} connection - An OpenTok connection object
   * @returns {Boolean}
   */


  _createClass(OpenTokSDK, [{
    key: 'isMe',
    value: function isMe(connection) {
      var session = this.session;

      return session && session.connection.connectionId === connection.connectionId;
    }

    /**
     * Wrap OpenTok session events
     */

  }, {
    key: 'setInternalListeners',
    value: function setInternalListeners() {
      /**
       * Wrap session events and update state when streams are created
       * or destroyed
       */
      var state = stateMap.get(this);
      this.session.on('streamCreated', function (_ref) {
        var stream = _ref.stream;
        return state.addStream(stream);
      });
      this.session.on('streamDestroyed', function (_ref2) {
        var stream = _ref2.stream;
        return state.removeStream(stream);
      });
    }

    /**
     * Register a callback for a specific event, pass an object
     * with event => callback key/values (or an array of objects)
     * to register callbacks for multiple events.
     * @param {String | Object | Array} [events] - The name of the events
     * @param {Function} [callback]
     * https://tokbox.com/developer/sdks/js/reference/Session.html#on
     */

  }, {
    key: 'on',
    value: function on() {
      if (arguments.length === 1 && _typeof(arguments.length <= 0 ? undefined : arguments[0]) === 'object') {
        bindListeners(this.session, this, arguments.length <= 0 ? undefined : arguments[0]);
      } else if (arguments.length === 2) {
        bindListener(this.session, this, arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1]);
      }
    }

    /**
     * Remove a callback for a specific event. If no parameters are passed,
     * all callbacks for the session will be removed.
     * @param {String} [events] - The name of the events
     * @param {Function} [callback]
     * https://tokbox.com/developer/sdks/js/reference/Session.html#off
     */

  }, {
    key: 'off',
    value: function off() {
      var _session;

      (_session = this.session).off.apply(_session, arguments);
    }

    /**
     * Enable or disable local publisher audio
     * @param {Boolean} enable
     */

  }, {
    key: 'enablePublisherAudio',
    value: function enablePublisherAudio(enable) {
      var _stateMap$get$getPubS = stateMap.get(this).getPubSub(),
          publishers = _stateMap$get$getPubS.publishers;

      Object.keys(publishers.camera).forEach(function (publisherId) {
        publishers.camera[publisherId].publishAudio(enable);
      });
    }

    /**
     * Enable or disable local publisher video
     * @param {Boolean} enable
     */

  }, {
    key: 'enablePublisherVideo',
    value: function enablePublisherVideo(enable) {
      var _stateMap$get$getPubS2 = stateMap.get(this).getPubSub(),
          publishers = _stateMap$get$getPubS2.publishers;

      Object.keys(publishers.camera).forEach(function (publisherId) {
        publishers.camera[publisherId].publishVideo(enable);
      });
    }

    /**
     * Enable or disable local subscriber audio
     * @param {String} streamId
     * @param {Boolean} enable
     */

  }, {
    key: 'enableSubscriberAudio',
    value: function enableSubscriberAudio(streamId, enable) {
      var _stateMap$get$all = stateMap.get(this).all(),
          streamMap = _stateMap$get$all.streamMap,
          subscribers = _stateMap$get$all.subscribers;

      var subscriberId = streamMap[streamId];
      var subscriber = subscribers.camera[subscriberId] || subscribers.screen[subscriberId];
      subscriber && subscriber.subscribeToVideo(enable);
    }

    /**
     * Enable or disable local subscriber video
     * @param {String} streamId
     * @param {Boolean} enable
     */

  }, {
    key: 'enableSubscriberVideo',
    value: function enableSubscriberVideo(streamId, enable) {
      var _stateMap$get$all2 = stateMap.get(this).all(),
          streamMap = _stateMap$get$all2.streamMap,
          subscribers = _stateMap$get$all2.subscribers;

      var subscriberId = streamMap[streamId];
      var subscriber = subscribers.camera[subscriberId] || subscribers.screen[subscriberId];
      subscriber && subscriber.subscribeToAudio(enable);
    }

    /**
     * Create and publish a stream
     * @param {String | Object} element - The target element
     * @param {Object} properties - The publisher properties
     * @param {Array | Object} [eventListeners] - An object (or array of objects) with
     *        eventName/callback k/v pairs
     * @param {Boolean} [preview] - Create a publisher with publishing to the session
     * @returns {Promise} <resolve: Object, reject: Error>
     */

  }, {
    key: 'publish',
    value: function publish(element, properties) {
      var _this = this;

      var eventListeners = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var preview = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      return new Promise(function (resolve, reject) {
        initPublisher(element, properties) // eslint-disable-next-line no-confusing-arrow
        .then(function (publisher) {
          eventListeners && bindListeners(publisher, _this, eventListeners);
          if (preview) {
            resolve(publisher);
          } else {
            _this.publishPreview(publisher).then(resolve).catch(reject);
          }
        }).catch(reject);
      });
    }

    /**
     * Publish a 'preview' stream to the session
     * @param {Object} publisher - An OpenTok publisher object
     * @returns {Promise} <resolve: empty, reject: Error>
     */

  }, {
    key: 'publishPreview',
    value: function publishPreview(publisher) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var state = stateMap.get(_this2);
        _this2.session.publish(publisher, function (error) {
          error && reject(error);
          var type = publisher.stream.videoType;
          state.addPublisher(type, publisher);
          resolve(publisher);
        });
      });
    }

    /**
     * Stop publishing a stream
     * @param {Object} publisher - An OpenTok publisher object
     */

  }, {
    key: 'unpublish',
    value: function unpublish(publisher) {
      var type = publisher.stream.videoType;
      var state = stateMap.get(this);
      this.session.unpublish(publisher);
      state.removePublisher(type, publisher);
    }

    /**
     * Subscribe to stream
     * @param {Object} stream
     * @param {String | Object} container - The id of the container or a reference to the element
     * @param {Object} [properties]
     * @param {Array | Object} [eventListeners] - An object (or array of objects) with
     *        eventName/callback k/v pairs
     * @returns {Promise} <resolve: empty, reject: Error>
     * https://tokbox.com/developer/sdks/js/reference/Session.html#subscribe
     */

  }, {
    key: 'subscribe',
    value: function subscribe(stream, container, properties, eventListeners) {
      var _this3 = this;

      var state = stateMap.get(this);
      return new Promise(function (resolve, reject) {
        var subscriber = _this3.session.subscribe(stream, container, properties, function (error) {
          if (error) {
            reject(error);
          } else {
            state.addSubscriber(subscriber);
            eventListeners && bindListeners(subscriber, _this3, eventListeners);
            resolve(subscriber);
          }
        });
      });
    }

    /**
     * Unsubscribe from a stream and update the state
     * @param {Object} subscriber - An OpenTok subscriber object
     * @returns {Promise} <resolve: empty>
     */

  }, {
    key: 'unsubscribe',
    value: function unsubscribe(subscriber) {
      var _this4 = this;

      var state = stateMap.get(this);
      return new Promise(function (resolve) {
        _this4.session.unsubscribe(subscriber);
        state.removeSubscriber(subscriber);
        resolve();
      });
    }

    /**
     * Connect to the OpenTok session
     * @param {Array | Object} [eventListeners] - An object (or array of objects) with
     *        eventName/callback k/v pairs
     * @returns {Promise} <resolve: empty, reject: Error>
     */

  }, {
    key: 'connect',
    value: function connect(eventListeners) {
      var _this5 = this;

      this.off();
      eventListeners && this.on(eventListeners);
      return new Promise(function (resolve, reject) {
        var token = _this5.credentials.token;

        _this5.session.connect(token, function (error) {
          error ? reject(error) : resolve();
        });
      });
    }

    /**
     * Force a remote connection to leave the session
     * @param {Object} connection
     * @returns {Promise} <resolve: empty, reject: Error>
     */

  }, {
    key: 'forceDisconnect',
    value: function forceDisconnect(connection) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6.session.forceDisconnect(connection, function (error) {
          error ? reject(error) : resolve();
        });
      });
    }

    /**
     * Force the publisher of a stream to stop publishing the stream
     * @param {Object} stream
     * @returns {Promise} <resolve: empty, reject: Error>
     */

  }, {
    key: 'forceUnpublish',
    value: function forceUnpublish(stream) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        _this7.session.forceUnpublish(stream, function (error) {
          error ? reject(error) : resolve();
        });
      });
    }

    /**
     * Send a signal using the OpenTok signaling apiKey
     * @param {String} type
     * @param {*} signalData
     * @param {Object} [to] - An OpenTok connection object
     * @returns {Promise} <resolve: empty, reject: Error>
     * https://tokbox.com/developer/guides/signaling/js/
     */

  }, {
    key: 'signal',
    value: function signal(type, signalData, to) {
      var _this8 = this;

      var data = JSON.stringify(signalData);
      var signal = to ? { type: type, data: data, to: to } : { type: type, data: data };
      return new Promise(function (resolve, reject) {
        _this8.session.signal(signal, function (error) {
          error ? reject(error) : resolve();
        });
      });
    }

    /**
     * Disconnect from the OpenTok session
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.session.disconnect();
      stateMap.get(this).reset();
    }

    /**
     * Return the state of the OpenTok session
     * @returns {Object} Streams, publishers, subscribers, and stream map
     */

  }, {
    key: 'state',
    value: function state() {
      return stateMap.get(this).all();
    }
  }]);

  return OpenTokSDK;
}();

if (global === window) {
  window.OpenTokSDK = OpenTokSDK;
}

module.exports = OpenTokSDK;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./errors":7,"./state":9}],9:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = function () {
  function State() {
    _classCallCheck(this, State);

    this.publishers = {
      camera: {},
      screen: {}
    };

    this.subscribers = {
      camera: {},
      screen: {}
    };

    this.streams = {};

    // Map stream ids to subscriber/publisher ids
    this.streamMap = {};

    // OpenTok session
    this.session = null;

    // OpenTok credentials
    this.credentials = null;
  }

  // Get the current OpenTok session


  _createClass(State, [{
    key: "getSession",
    value: function getSession() {
      return this.session;
    }

    // Set the current OpenTok session

  }, {
    key: "setSession",
    value: function setSession(session) {
      this.session = session;
    }

    // Get the current OpenTok credentials

  }, {
    key: "getCredentials",
    value: function getCredentials() {
      return this.credentials;
    }
    // Set the current OpenTok credentials

  }, {
    key: "setCredentials",
    value: function setCredentials(credentials) {
      this.credentials = credentials;
    }

    /**
     * Returns the count of current publishers and subscribers by type
     * @retuns {Object}
     *    {
     *      publishers: {
     *        camera: 1,
     *        screen: 1,
     *        total: 2
     *      },
     *      subscribers: {
     *        camera: 3,
     *        screen: 1,
     *        total: 4
     *      }
     *   }
     */

  }, {
    key: "pubSubCount",
    value: function pubSubCount() {
      var publishers = this.publishers,
          subscribers = this.subscribers;
      /* eslint-disable no-param-reassign */

      var pubs = Object.keys(publishers).reduce(function (acc, source) {
        acc[source] = Object.keys(publishers[source]).length;
        acc.total += acc[source];
        return acc;
      }, { camera: 0, screen: 0, total: 0 });

      var subs = Object.keys(subscribers).reduce(function (acc, source) {
        acc[source] = Object.keys(subscribers[source]).length;
        acc.total += acc[source];
        return acc;
      }, { camera: 0, screen: 0, total: 0 });
      /* eslint-enable no-param-reassign */
      return { publisher: pubs, subscriber: subs };
    }

    /**
     * Returns the current publishers and subscribers, along with a count of each
     */

  }, {
    key: "getPubSub",
    value: function getPubSub() {
      var publishers = this.publishers,
          subscribers = this.subscribers;

      return { publishers: publishers, subscribers: subscribers, meta: this.pubSubCount() };
    }
  }, {
    key: "addPublisher",
    value: function addPublisher(type, publisher) {
      this.streamMap[publisher.streamId] = publisher.id;
      this.publishers[type][publisher.id] = publisher;
    }
  }, {
    key: "removePublisher",
    value: function removePublisher(type, publisher) {
      var id = publisher.id || this.streamMap[publisher.streamId];
      delete this.publishers[type][id];
    }
  }, {
    key: "removeAllPublishers",
    value: function removeAllPublishers() {
      this.publishers.camera = {};
      this.publishers.screen = {};
    }
  }, {
    key: "addSubscriber",
    value: function addSubscriber(subscriber) {
      var type = subscriber.stream.videoType;
      var streamId = subscriber.stream.id;
      this.subscribers[type][subscriber.id] = subscriber;
      this.streamMap[streamId] = subscriber.id;
    }
  }, {
    key: "removeSubscriber",
    value: function removeSubscriber() {
      var subscriber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var stream = subscriber.stream;

      var type = stream && stream.videoType;
      delete this.subscribers[type][subscriber.id];
    }
  }, {
    key: "addStream",
    value: function addStream(stream) {
      this.streams[stream.id] = stream;
    }
  }, {
    key: "removeStream",
    value: function removeStream(stream) {
      var type = stream.videoType;
      var subscriberId = this.streamMap[stream.id];
      delete this.streamMap[stream.id];
      delete this.streams[stream.id];
      this.removeSubscriber(this.subscribers[type][subscriberId]);
    }
  }, {
    key: "getStreams",
    value: function getStreams() {
      return this.streams;
    }

    /** Reset streams, publishers, and subscribers */

  }, {
    key: "reset",
    value: function reset() {
      this.streams = {};
      this.streamMap = {};
      this.publishers = { camera: {}, screen: {} };
      this.subscribers = { camera: {}, screen: {} };
    }
  }, {
    key: "all",
    value: function all() {
      var streams = this.streams,
          streamMap = this.streamMap;

      return Object.assign({}, this.getPubSub(), { streams: streams, streamMap: streamMap });
    }
  }]);

  return State;
}();

module.exports = State;

},{}],10:[function(require,module,exports){
'use strict';

/**
 * Internal variables
 */

// Map publisher ids to publisher objects
var publishers = {
  camera: {},
  screen: {}
};

// Map subscriber id to subscriber objects
var subscribers = {
  camera: {},
  screen: {},
  sip: {}
};

// Map stream ids to stream objects
var streams = {};

// Map stream ids to subscriber/publisher ids
var streamMap = {};

var session = null;
var credentials = null;
var options = null;

/**
 * Internal methods
 */

/**
 * Returns the count of current publishers and subscribers by type
 * @retuns {Object}
 *    {
 *      publishers: {
 *        camera: 1,
 *        screen: 1,
 *        total: 2
 *      },
 *      subscribers: {
 *        camera: 3,
 *        screen: 1,
 *        total: 4
 *      }
 *   }
 */
var pubSubCount = function pubSubCount() {
  /* eslint-disable no-param-reassign */
  var pubs = Object.keys(publishers).reduce(function (acc, source) {
    acc[source] = Object.keys(publishers[source]).length;
    acc.total += acc[source];
    return acc;
  }, { camera: 0, screen: 0, total: 0 });

  var subs = Object.keys(subscribers).reduce(function (acc, source) {
    acc[source] = Object.keys(subscribers[source]).length;
    acc.total += acc[source];
    return acc;
  }, { camera: 0, screen: 0, sip: 0, total: 0 });
  /* eslint-enable no-param-reassign */
  return { publisher: pubs, subscriber: subs };
};

/**
 * Returns the current publishers and subscribers, along with a count of each
 * @returns {Object}
 */
var getPubSub = function getPubSub() {
  return { publishers: publishers, subscribers: subscribers, meta: pubSubCount() };
};

/**
 * Get streams, streamMap, publishers, and subscribers
 * @return {Object}
 */
var all = function all() {
  return Object.assign({}, { streams: streams, streamMap: streamMap }, getPubSub());
};

/**
 * Get the current OpenTok session
 * @returns {Object}
 */
var getSession = function getSession() {
  return session;
};

/**
 * Set the current OpenTok session
 * @param {Object} otSession
 */
var setSession = function setSession(otSession) {
  session = otSession;
};

/**
 * Get the current OpenTok credentials
 * @returns {Object}
 */
var getCredentials = function getCredentials() {
  return credentials;
};

/**
 * Set the current OpenTok credentials
 * @param {Object} otCredentials
 */
var setCredentials = function setCredentials(otCredentials) {
  credentials = otCredentials;
};

/**
 * Get the options defined for core
 * @returns {Object}
 */
var getOptions = function getOptions() {
  return options;
};

/**
 * Set the options defined for core
 * @param {Object} otOptions
 */
var setOptions = function setOptions(otOptions) {
  options = otOptions;
};

/**
 * Add a stream to state
 * @param {Object} stream - An OpenTok stream object
 */
var addStream = function addStream(stream) {
  streams[stream.id] = stream;
};

/**
 * Remove a stream from state and any associated subscribers
 * @param {Object} stream - An OpenTok stream object
 */
var removeStream = function removeStream(stream) {
  var type = stream.videoType;
  var subscriberId = streamMap[stream.id];
  delete streamMap[stream.id];
  delete subscribers[type][subscriberId];
  delete streams[stream.id];
};

/**
 * Get all remote streams
 * @returns {Object}
 */
var getStreams = function getStreams() {
  return streams;
};

/**
 * Get the map of stream ids to publisher/subscriber ids
 * @returns {Object}
 */
var getStreamMap = function getStreamMap() {
  return streamMap;
};

/**
 * Add a publisher to state
 * @param {String} type - 'camera' or 'screen'
 * @param {Object} publisher - The OpenTok publisher object
 */
var addPublisher = function addPublisher(type, publisher) {
  streamMap[publisher.streamId] = publisher.id;
  publishers[type][publisher.id] = publisher;
};

/**
 * Remove a publisher from state
 * @param {String} type - 'camera' or 'screen'
 * @param {Object} publisher - The OpenTok publisher object
 */
var removePublisher = function removePublisher(type, publisher) {
  var id = publisher.id || streamMap[publisher.streamId];
  delete publishers[type][id];
  delete streamMap[publisher.streamId];
};

/**
 * Remove all publishers from state
 */
var removeAllPublishers = function removeAllPublishers() {
  ['camera', 'screen'].forEach(function (type) {
    Object.values(publishers[type]).forEach(function (publisher) {
      removePublisher(type, publisher);
    });
  });
};

/**
 * Add a subscriber to state
 * @param {Object} - An OpenTok subscriber object
 */
var addSubscriber = function addSubscriber(subscriber) {
  var type = subscriber.stream.videoType;
  var streamId = subscriber.stream.id;
  subscribers[type][subscriber.id] = subscriber;
  streamMap[streamId] = subscriber.id;
};

/**
 * Remove a publisher from state
 * @param {String} type - 'camera' or 'screen'
 * @param {Object} subscriber - The OpenTok subscriber object
 */
var removeSubscriber = function removeSubscriber(type, subscriber) {
  var id = subscriber.id || streamMap[subscriber.streamId];
  delete subscribers[type][id];
  delete streamMap[subscriber.streamId];
};

/**
 * Remove all subscribers from state
 */
var removeAllSubscribers = function removeAllSubscribers() {
  ['camera', 'screen', 'sip'].forEach(function (type) {
    Object.values(subscribers[type]).forEach(function (subscriber) {
      removeSubscriber(type, subscriber);
    });
  });
};

/**
 * Reset state
 */
var reset = function reset() {
  removeAllPublishers();
  removeAllSubscribers();
  [streams, streamMap].forEach(function (streamObj) {
    Object.keys(streamObj).forEach(function (streamId) {
      delete streamObj[streamId]; // eslint-disable-line no-param-reassign
    });
  });
};

/** Exports */
module.exports = {
  all: all,
  getSession: getSession,
  setSession: setSession,
  getCredentials: getCredentials,
  setCredentials: setCredentials,
  getOptions: getOptions,
  setOptions: setOptions,
  addStream: addStream,
  removeStream: removeStream,
  getStreams: getStreams,
  getStreamMap: getStreamMap,
  addPublisher: addPublisher,
  removePublisher: removePublisher,
  removeAllPublishers: removeAllPublishers,
  addSubscriber: addSubscriber,
  removeSubscriber: removeSubscriber,
  removeAllSubscribers: removeAllSubscribers,
  getPubSub: getPubSub,
  reset: reset
};

},{}],11:[function(require,module,exports){
'use strict';

/** Wrap DOM selector methods:
 *  document.querySelector,
 *  document.getElementById,
 *  document.getElementsByClassName
 *  'element' checks for a string before returning an element with `query`
 */
var dom = {
  query: function query(arg) {
    return document.querySelector(arg);
  },
  id: function id(arg) {
    return document.getElementById(arg);
  },
  class: function _class(arg) {
    return document.getElementsByClassName(arg);
  },
  element: function element(el) {
    return typeof el === 'string' ? this.query(el) : el;
  }
};

/**
 * Returns a (nested) propery from an object, or undefined if it doesn't exist
 * @param {String | Array} props - An array of properties or a single property
 * @param {Object | Array} obj
 */
var path = function path(props, obj) {
  var nested = obj;
  var properties = typeof props === 'string' ? props.split('.') : props;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var property = _step.value;

      nested = nested[property];
      if (nested === undefined) {
        return nested;
      }
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

  return nested;
};

/**
 * Checks for a (nested) propery in an object and returns the property if
 * it exists.  Otherwise, it returns a default value.
 * @param {*} d - Default value
 * @param {String | Array} props - An array of properties or a single property
 * @param {Object | Array} obj
 */
var pathOr = function pathOr(d, props, obj) {
  var value = path(props, obj);
  return value === undefined ? d : value;
};

/**
 * Converts a string to proper case (e.g. 'camera' => 'Camera')
 * @param {String} text
 * @returns {String}
 */
var properCase = function properCase(text) {
  return '' + text[0].toUpperCase() + text.slice(1);
};

module.exports = {
  dom: dom,
  path: path,
  pathOr: pathOr,
  properCase: properCase
};

},{}]},{},[3]);
