/* global OT OTSolution ScreenSharingAccPack define */
(function () {

  var _this;
  var _accPack;
  var _canvas;
  var _elements = {};

  // Trigger event via common layer API
  var _triggerEvent = function (event, data) {
    if (_accPack) {
      _accPack.triggerEvent(event, data);
    }
  };

  var _registerEvents = function () {
    var events = [
      'startAnnotation',
      'linkAnnotation',
      'resizeCanvas',
      'annotationWindowClosed',
      'endAnnotation'
    ];

    _accPack.registerEvents(events);
  };

  var _setupUI = function () {
    var toolbar = ['<div id="toolbar"></div>'].join('\n');
    $('body').append(toolbar);
  };

  // Toolbar items
  var _defaultToolbarItems = [{
    id: 'OT_pen',
    title: 'Pen',
    icon: '../images/annotation/freehand.png',
    selectedIcon: '../images/annotation/freehand_selected.png'
  }, {
    id: 'OT_line',
    title: 'Line',
    icon: '../images/annotation/line.png',
    selectedIcon: '../images/annotation/line_selected.png'
  }, {
    id: 'OT_text',
    title: 'Text',
    icon: '../images/annotation/text.png',
    selectedIcon: '../images/annotation/text.png'
  }, {
    id: 'OT_shapes',
    title: 'Shapes',
    icon: '../images/annotation/shapes.png',
    items: [{
      id: 'OT_arrow',
      title: 'Arrow',
      icon: '../images/annotation/arrow.png'
    }, {
      id: 'OT_rect',
      title: 'Rectangle',
      icon: '../images/annotation/rectangle.png'
    }, {
      id: 'OT_oval',
      title: 'Oval',
      icon: '../images/annotation/oval.png'
    }, {
      id: 'OT_star',
      title: 'Star',
      icon: '../images/annotation/star.png',
      points: [
        /* eslint-disable max-len */
        [0.5 + 0.5 * Math.cos(90 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(90 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(126 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(126 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(162 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(162 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(198 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(198 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(234 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(234 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(270 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(270 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(306 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(306 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(342 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(342 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(18 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(18 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(54 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(54 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(90 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(90 * (Math.PI / 180))]
        /* eslint-enable max-len */
      ]
    }]
  }, {
    id: 'OT_colors',
    title: 'Colors',
    icon: '',
    items: { /* Built dynamically */ }
  }, {
    id: 'OT_line_width',
    title: 'Line Width',
    icon: '../images/annotation/line_width.png',
    items: { /* Built dynamically */ }
  }, {
    id: 'OT_clear',
    title: 'Clear',
    icon: '../images/annotation/clear.png'
  }];

  var _palette = [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#8e44ad',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#ded5d5'
  ];

  var _aspectRatio = (10 / 6);

  /** Private methods */

  var _refreshCanvas = _.throttle(function () {
    _canvas.onResize();
  }, 1000);

  /** Resize the canvas to match the size of its container */
  var _resizeCanvas = function () {

    var width;
    var height;

    if (!!_elements.externalWindow) {

      var windowDimensions = {
        width: _elements.externalWindow.innerWidth,
        height: _elements.externalWindow.innerHeight
      };

      var computedHeight = windowDimensions.width / _aspectRatio;

      if (computedHeight <= windowDimensions.height) {
        width = windowDimensions.width;
        height = computedHeight;
      } else {
        height = windowDimensions.height;
        width = height * _aspectRatio;
      }

    } else {
      var el = _elements.absoluteParent || _elements.canvasContainer;
      width = $(el).width();
      height = $(el).height();
    }

    $(_elements.canvasContainer).css({
      width: width,
      height: height
    });

    $(_elements.canvas).css({
      width: width,
      height: height
    });

    $(_elements.canvas).attr({
      width: width,
      height: height
    });

    _refreshCanvas();
    _triggerEvent('resizeCanvas');
  };

  var _listenForResize = function () {
    $(_elements.resizeSubject).on('resize', _.throttle(function () {
      _resizeCanvas();
    }, 500));
  };

  var _createToolbar = function (session, options, externalWindow) {

    var toolbarId = _.property('toolbarId')(options) || 'toolbar';
    var items = _.property('toolbarItems')(options) || _defaultToolbarItems;
    var colors = _.property('colors')(options) || _palette;

    var container = function () {
      var w = !!externalWindow ? externalWindow : window;
      return w.document.getElementById(toolbarId);
    };

    /* eslint-disable no-native-reassign */
    toolbar = new OTSolution.Annotations.Toolbar({
      session: session,
      container: container(),
      colors: colors,
      items: items,
      externalWindow: externalWindow || null
    });
    /* eslint-enable no-native-reassign */

  };

  // Create external screen sharing window
  var _createExternalWindow = function () {

    var deferred = $.Deferred();

    var width = screen.width * 0.80 | 0;
    var height = width / (_aspectRatio);
    var url = ['templates/screenshare.html?opentok-annotation'].join('');

    var windowFeatures = [
      'toolbar=no',
      'location=no',
      'directories=no',
      'status=no',
      'menubar=no',
      'scrollbars=no',
      'resizable=no',
      'copyhistory=no',
      ['width=', width].join(''),
      ['height=', height].join(''),
      ['left=', ((screen.width / 2) - (width / 2))].join(''),
      ['top=', ((screen.height / 2) - (height / 2))].join('')
    ].join(',');

    var annotationWindow = window.open(url, '', windowFeatures);
    window.onbeforeunload = function () {
      annotationWindow.close();
    };

    // External window needs access to certain globals
    annotationWindow.toolbar = toolbar;
    annotationWindow.OT = OT;
    annotationWindow.$ = $;

    annotationWindow.triggerCloseEvent = function () {
      _triggerEvent('annotationWindowClosed');
    };

    // TODO Find something better.
    var windowReady = function () {
      if (!!annotationWindow.createContainerElements) {
        $(annotationWindow.document).ready(function () {
          deferred.resolve(annotationWindow);
        });
      } else {
        setTimeout(windowReady, 100);
      }
    };

    windowReady();

    return deferred.promise();
  };

  // Remove the toolbar and cancel event listeners
  var _removeToolbar = function () {
    $(_elements.resizeSubject).off('resize', _resizeCanvas);
    toolbar.remove();
  };

  /**
   * Creates an external window (if required) and links the annotation toolbar
   * to the session
   * @param {object} session
   * @param {object} [options]
   * @param {boolean} [options.screensharing] - Using an external window
   * @param {string} [options.toolbarId] - If the container has an id other than 'toolbar'
   * @param {array} [options.items] - Custom set of tools
   * @param {array} [options.colors] - Custom color palette
   * @returns {promise} < Resolve: undefined | {object} Reference to external annotation window >
   */
  var start = function (session, options) {

    var deferred = $.Deferred();

    if (_.property('screensharing')(options)) {
      _createExternalWindow()
        .then(function (externalWindow) {
          _createToolbar(session, options, externalWindow);
          toolbar.createPanel(externalWindow);
          _triggerEvent('startAnnotation', externalWindow);
          deferred.resolve(externalWindow);
        });
    } else {
      _createToolbar(session, options);
      _triggerEvent('startAnnotation');
      deferred.resolve();
    }

    return deferred.promise();
  };

  /**
   * @param {object} pubSub - Either the publisher(sharing) or subscriber(viewing)
   * @ param {object} container - The parent container for the canvas element
   * @ param {object} options
   * @param {object} options.canvasContainer - The id of the parent for the annotation canvas
   * @param {object} [options.externalWindow] - Reference to the annotation window if publishing
   * @param {array} [options.absoluteParent] - Reference element for resize if other than container
   */
  var linkCanvas = function (pubSub, container, options) {

    /**
     * jQuery only allows listening for a resize event on the window or a
     * jQuery resizable element, like #wmsFeedWrap.  windowRefernce is a
     * reference to the popup window created for annotation.  If this doesn't
     * exist, we are watching the canvas belonging to the party viewing the
     * shared screen
     */
    _elements.resizeSubject = _.property('externalWindow')(options) || window;
    _elements.externalWindow = _.property('externalWindow')(options) || null;
    _elements.absoluteParent = _.property('absoluteParent')(options) || null;
    _elements.canvasContainer = container;


    // The canvas object
    _canvas = new OTSolution.Annotations({
      feed: pubSub,
      container: container,
      externalWindow: _elements.externalWindow
    });

    toolbar.addCanvas(_canvas);

    _canvas.onScreenCapture(function (dataUrl) {
      var win = window.open(dataUrl, '_blank');
      win.focus();
    });


    var context = _elements.externalWindow ? _elements.externalWindow : window;
    // The canvas DOM element
    _elements.canvas = $(_.first(context.document.getElementsByTagName('canvas')));

    _listenForResize();
    _resizeCanvas();
    _triggerEvent('linkAnnotation');

  };


  var resizeCanvas = function () {
    _resizeCanvas();
  };

  /**
   * Stop annotation and clean up components
   * @param {Boolean} publisher Are we the publisher?
   */
  var end = function (publisher) {
    _removeToolbar();
    _elements.canvas = null;
    if (!!publisher) {
      if (!!_elements.externalWindow) {
        _elements.externalWindow.close();
        _elements.externalWindow = null;
        _elements.resizeSubject = null;
      }
      _triggerEvent('endAnnotation');
    }
  };

  /**
   * @constructor
   * Represents an annotation component, used for annotation over video or a shared screen
   * @param {object} options
   * @param {object} options.canvasContainer - The id of the parent for the annotation canvas
   * @param {object} options.watchForResize - The DOM element to watch for resize
   */
  var AnnotationAccPack = function (options) {
    _this = this;
    _this.options = _.omit(options, 'accPack');
    _accPack = _.property('accPack')(options);
    _registerEvents();
    _setupUI();
  };

  AnnotationAccPack.prototype = {
    constructor: AnnotationAccPack,
    start: start,
    linkCanvas: linkCanvas,
    resizeCanvas: resizeCanvas,
    end: end
  };

  if (typeof exports === 'object') {
    module.exports = AnnotationAccPack;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return AnnotationAccPack;
    });
  } else {
    this.AnnotationAccPack = AnnotationAccPack;
  }

}.call(this));

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

/* global chrome OT ScreenSharingAccPack define */
(function () {


  /** Private Variables*/
  var _this; // Reference to instance of ScreenSharingAccPack
  var _active; // Currently sharing screen?
  var _accPack; // Common layer API
  var _session; // OpenTok session

  var _screenSharingControl = [
    '<div class="video-control circle share-screen" id="startScreenSharing"></div>'
  ].join('\n');

  var _screenSharingView = [
    '<div class="hidden" id="screenShareView">',
    '<div class="wms-feed-main-video">',
    '<div class="wms-feed-holder" id="videoHolderScreenShare"></div>',
    '<div class="wms-feed-mask"></div>',
    '<img src="/images/mask/video-mask.png"/>',
    '</div>',
    '<div class="wms-feed-call-controls" id="feedControlsFromScreen">',
    '<button class="wms-icon-screen active hidden" id="endScreenShareBtn"></button>',
    '</div>',
    '</div>'
  ].join('\n');

  var _screenDialogsExtensions = [
    /* eslint-disable max-len */
    '<div id="dialog-form-chrome" class="wms-modal" style="display: none;">',
    '<div class="wms-modal-body">',
    '<div class="wms-modal-title with-icon">',
    '<i class="wms-icon-share-large"></i>',
    '<span>Screen Share<br/>Extension Installation</span>',
    '</div>',
    '<p>You need a Chrome extension to share your screen. Install Screensharing Extension. Once you have installed, please, click the share screen button again.</p>',
    '<button id="btn-install-plugin-chrome" class="wms-btn-install">Accept</button>',
    '<button id="btn-cancel-plugin-chrome" class="wms-cancel-btn-install"></button>',
    '</div>',
    '</div>',
    '<div id="dialog-form-ff" class="wms-modal" style="display: none;">',
    '<div class="wms-modal-body">',
    '<div class="wms-modal-title with-icon">',
    '<i class="wms-icon-share-large"></i>',
    '<span>Screen Share<br/>Extension Installation</span>',
    '</div>',
    '<p>You need a Firefox extension to share your screen. Install Screensharing Extension. Once you have installed, refresh your browser and click the share screen button again.</p>',
    '<a href="#" id="btn-install-plugin-ff" class="wms-btn-install" href="">Install extension</a>',
    '<a href="#" id="btn-cancel-plugin-ff" class="wms-cancel-btn-install"></a>',
    '</div>',
    '</div>'
    /* eslint-enable max-len */
  ].join('\n');

  /** Private Methods */

  var _setupUI = function (parent) {
    $('body').append(_screenDialogsExtensions);
    $(_this._screenSharingControls).append(_screenSharingControl);
    $(parent).append(_screenSharingView);
  };

  var _toggleScreenSharingButton = function (show) {
    $('#startScreenSharing')[show ? 'show' : 'hide']();
  };

  // Trigger event via common layer API
  var _triggerEvent = function (event, data) {
    if (_accPack) {
      _accPack.triggerEvent(event, data);
    }
  };

  /**
   * Create a publisher for the screen.  If we're using annotation, we first need
   * to create the annotion window and get a reference to its annotation container
   * element so that we can pass it to the initPublisher function.
   * @returns {promise} < Resolve: [Object] Container element for annotation in external window >
   */
  var _initPublisher = function () {

    var createPublisher = function (publisherDiv) {

      var innerDeferred = $.Deferred();

      var container = publisherDiv || $('#videoHolderScreenShare');

      _this.publisher = OT.initPublisher(container, _this.localScreenProperties, function (error) {
        if (error) {
          _triggerEvent('screenSharingError', error);
          innerDeferred.reject(_.extend(_.omit(error, 'messsage'), {
            message: 'Error starting the screen sharing'
          }));
        } else {
          innerDeferred.resolve();
        }
      });

      return innerDeferred.promise();
    };

    var outerDeferred = $.Deferred();

    if (!!_this.annotation) {

      _accPack.setupExternalAnnotation()
        .then(function (annotationWindow) {
          _this.annotationWindow = annotationWindow || null;
          var annotationElements = annotationWindow.createContainerElements();
          createPublisher(annotationElements.publisher)
            .then(function () {
              outerDeferred.resolve(annotationElements.annotation);
            });

        });
    } else {

      createPublisher()
        .then(function () {
          outerDeferred.resolve();
        });

    }

    return outerDeferred.promise();
  };


  /**
   * Start publishing the screen
   * @param annotationContainer
   */
  var _publish = function (annotationContainer) {

    _session.publish(_this.publisher, function (error) {
      if (error) {

        // Let's write our own error message
        var customError = _.omit(error, 'message');

        if (error.code === 1500 && navigator.userAgent.indexOf('Firefox') !== -1) {
          $('#dialog-form-ff').toggle();
        } else {

          var errorMessage;

          if (error.code === 1010) {
            errorMessage = 'Check your network connection';
          } else {
            errorMessage = 'Error sharing the screen';
          }

          customError.message = errorMessage;
          _triggerEvent('screenSharingError', customError);
        }
      } else {
        if (_this.annotation) {
          _accPack.linkAnnotation(_this.publisher, annotationContainer, _this.annotationWindow);
        }
        _active = true;
        _triggerEvent('startScreenSharing');

      }
    });

  };

  /**
   * Stop publishing the screen
   */
  var _stopPublishing = function () {
    _session.unpublish(_this.publisher);
    _this.publisher = null;
  };

  /** Public Methods */

  var extensionAvailable = function () {

    var deferred = $.Deferred();

    if (window.location.protocol === 'http:') {
      alert("Screensharing only works under 'https', please add 'https://' in front of your debugger url.");
      deferred.reject('https required');
    }

    OT.checkScreenSharingCapability(function (response) {
      console.log('checkScreenSharingCapability', response);
      if (!response.supported || !response.extensionRegistered) {
        if (OT.$.browser() === 'Firefox' && response.extensionInstalled) {
          deferred.resolve();
        } else {
          alert('This browser does not support screen sharing! Please use Chrome, Firefox or IE!');
          deferred.reject('browser support not available');
        }
      } else if (!response.extensionInstalled) {
        $('#dialog-form-chrome').toggle();
        deferred.reject('screensharing extension not installed');
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise();

  };

  var start = function () {
    extensionAvailable(_this.extensionID, _this.extensionPathFF)
      .then(_initPublisher)
      .then(_publish)
      .fail(function (error) {
        console.log('Error starting screensharing: ', error);
      });

  };

  var end = function (callEnded) {
    _stopPublishing();
    _active = false;
    if (callEnded) {
      _toggleScreenSharingButton(false);
    }
    _triggerEvent('endScreenSharing');
  };

  /** Events */

  var _registerEvents = function () {

    if (!_accPack) {
      return;
    }

    var events = ['startScreenSharing', 'endScreenSharing', 'screenSharingError'];
    _accPack.registerEvents(events);
  };

  var _addScreenSharingListeners = function () {

    var startOrEnd = _.throttle(function () {
      !!_active ? end() : start();
    }, 750);

    $('#startScreenSharing').on('click', startOrEnd);

    /** Handlers for screensharing extension modal */
    $('#btn-install-plugin-chrome').on('click', function () {
      chrome.webstore.install(['https://chrome.google.com/webstore/detail/', _this.extensionID].join(''),
        function (success) {
          console.log('success', success);
        },
        function (error) {
          console.log('error', error);
        });
      $('#dialog-form-chrome').toggle();
    });

    $('#btn-cancel-plugin-chrome').on('click', function () {
      $('#dialog-form-chrome').toggle();
    });

    $('#btn-install-plugin-ff').prop('href', _this.extensionPathFF);

    $('#btn-install-plugin-ff').on('click', function () {
      $('#dialog-form-ff').toggle();
    });

    $('#btn-cancel-plugin-ff').on('click', function () {
      $('#dialog-form-ff').toggle();
    });

    if (!!_accPack) {

      _accPack.registerEventListener('startCall', function () {
        _toggleScreenSharingButton(true);
      });

      _accPack.registerEventListener('endCall', function () {
        if (_active) {
          end(true);
        } else {
          _toggleScreenSharingButton(false);
        }
      });

      _accPack.registerEventListener('annotationWindowClosed', function () {
        end();
      });
    }

  };

  var _validateExtension = function (extensionID, extensionPathFF) {

    if (OT.$.browser() === 'Chrome') {
      if (!extensionID || !extensionID.length) {
        throw new Error('Error starting the screensharing. Chrome extensionID required');
      } else {
        $('<link/>', {
          rel: 'chrome-webstore-item',
          href: ['https://chrome.google.com/webstore/detail/', extensionID].join('')
        }).appendTo('head');

        OT.registerScreenSharingExtension('chrome', extensionID, 2);
      }
    }

    if (OT.$.browser() === 'Firefox' && (!extensionPathFF || !extensionPathFF.length)) {
      throw new Error('Error starting the screensharing. Firefox screensharing extension required');
    }
  };

  var _validateOptions = function (options) {

    if (!_.property('session', options)) {
      throw new Error('Screen Share Acc Pack requires an OpenTok session');
    }

    _session = _.property('session')(options);
    _accPack = _.property('accPack')(options);

    _validateExtension(_.property('extensionID')(options), _.property('extensionPathFF')(options));
  };

  /**
   * @constructor
   * Represents a screensharing component
   * @param {object} options
   * @param {string} options.session
   * @param {object} [options.accPack]
   * @param {string} [options.extensionID]
   * @param {string} [options.extentionPathFF]
   * @param {string} [options.screensharingParent]
   */
  var ScreenSharingAccPack = function (options) {

    _this = this;

    // Check for required options
    _validateOptions(options);

    // Extend our instance
    var optionsProps = [
      'annotation',
      'extensionURL',
      'extensionID',
      'extensionPathFF',
      'screensharingParent',
      'localScreenProperties'
    ];

    _.extend(_this, _.defaults(_.pick(options, optionsProps)), {
      screenSharingParent: '#videoContainer',
      _screenSharingControls: '#feedControls'
    });

    // Do UIy things
    _setupUI(_this.screensharingParent);
    _registerEvents();
    _addScreenSharingListeners();
  };

  ScreenSharingAccPack.prototype = {
    constructor: ScreenSharingAccPack,
    extensionAvailable: extensionAvailable,
    start: start,
    end: end
  };

  if (typeof exports === 'object') {
    module.exports = ScreenSharingAccPack;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return ScreenSharingAccPack;
    });
  } else {
    this.ScreenSharingAccPack = ScreenSharingAccPack;
  }

}.call(this));

/* global OT OTSolution ScreenSharingAccPack define */
(function () {

  var _this;
  var _accPack;
  var _canvas;
  var _elements = {};

  // Trigger event via common layer API
  var _triggerEvent = function (event, data) {
    if (_accPack) {
      _accPack.triggerEvent(event, data);
    }
  };

  var _registerEvents = function () {
    var events = [
      'startAnnotation',
      'linkAnnotation',
      'resizeCanvas',
      'annotationWindowClosed',
      'endAnnotation'
    ];

    _accPack.registerEvents(events);
  };

  var _setupUI = function () {
    var toolbar = ['<div id="toolbar"></div>'].join('\n');
    $('body').append(toolbar);
  };

  // Toolbar items
  var _defaultToolbarItems = [{
    id: 'OT_pen',
    title: 'Pen',
    icon: '../images/annotation/freehand.png',
    selectedIcon: '../images/annotation/freehand_selected.png'
  }, {
    id: 'OT_line',
    title: 'Line',
    icon: '../images/annotation/line.png',
    selectedIcon: '../images/annotation/line_selected.png'
  }, {
    id: 'OT_text',
    title: 'Text',
    icon: '../images/annotation/text.png',
    selectedIcon: '../images/annotation/text.png'
  }, {
    id: 'OT_shapes',
    title: 'Shapes',
    icon: '../images/annotation/shapes.png',
    items: [{
      id: 'OT_arrow',
      title: 'Arrow',
      icon: '../images/annotation/arrow.png'
    }, {
      id: 'OT_rect',
      title: 'Rectangle',
      icon: '../images/annotation/rectangle.png'
    }, {
      id: 'OT_oval',
      title: 'Oval',
      icon: '../images/annotation/oval.png'
    }, {
      id: 'OT_star',
      title: 'Star',
      icon: '../images/annotation/star.png',
      points: [
        /* eslint-disable max-len */
        [0.5 + 0.5 * Math.cos(90 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(90 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(126 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(126 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(162 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(162 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(198 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(198 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(234 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(234 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(270 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(270 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(306 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(306 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(342 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(342 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(18 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(18 * (Math.PI / 180))],
        [0.5 + 0.25 * Math.cos(54 * (Math.PI / 180)), 0.5 + 0.25 * Math.sin(54 * (Math.PI / 180))],
        [0.5 + 0.5 * Math.cos(90 * (Math.PI / 180)), 0.5 + 0.5 * Math.sin(90 * (Math.PI / 180))]
        /* eslint-enable max-len */
      ]
    }]
  }, {
    id: 'OT_colors',
    title: 'Colors',
    icon: '',
    items: { /* Built dynamically */ }
  }, {
    id: 'OT_line_width',
    title: 'Line Width',
    icon: '../images/annotation/line_width.png',
    items: { /* Built dynamically */ }
  }, {
    id: 'OT_clear',
    title: 'Clear',
    icon: '../images/annotation/clear.png'
  }];

  var _palette = [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#8e44ad',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#ded5d5'
  ];

  var _aspectRatio = (10 / 6);

  /** Private methods */

  var _refreshCanvas = _.throttle(function () {
    _canvas.onResize();
  }, 1000);

  /** Resize the canvas to match the size of its container */
  var _resizeCanvas = function () {

    var width;
    var height;

    if (!!_elements.externalWindow) {

      var windowDimensions = {
        width: _elements.externalWindow.innerWidth,
        height: _elements.externalWindow.innerHeight
      };

      var computedHeight = windowDimensions.width / _aspectRatio;

      if (computedHeight <= windowDimensions.height) {
        width = windowDimensions.width;
        height = computedHeight;
      } else {
        height = windowDimensions.height;
        width = height * _aspectRatio;
      }

    } else {
      var el = _elements.absoluteParent || _elements.canvasContainer;
      width = $(el).width();
      height = $(el).height();
    }

    $(_elements.canvasContainer).css({
      width: width,
      height: height
    });

    $(_elements.canvas).css({
      width: width,
      height: height
    });

    $(_elements.canvas).attr({
      width: width,
      height: height
    });

    _refreshCanvas();
    _triggerEvent('resizeCanvas');
  };

  var _listenForResize = function () {
    $(_elements.resizeSubject).on('resize', _.throttle(function () {
      _resizeCanvas();
    }, 500));
  };

  var _createToolbar = function (session, options, externalWindow) {

    var toolbarId = _.property('toolbarId')(options) || 'toolbar';
    var items = _.property('toolbarItems')(options) || _defaultToolbarItems;
    var colors = _.property('colors')(options) || _palette;

    var container = function () {
      var w = !!externalWindow ? externalWindow : window;
      return w.document.getElementById(toolbarId);
    };

    /* eslint-disable no-native-reassign */
    toolbar = new OTSolution.Annotations.Toolbar({
      session: session,
      container: container(),
      colors: colors,
      items: items,
      externalWindow: externalWindow || null
    });
    /* eslint-enable no-native-reassign */

  };

  // Create external screen sharing window
  var _createExternalWindow = function () {

    var deferred = $.Deferred();

    var width = screen.width * 0.80 | 0;
    var height = width / (_aspectRatio);
    var url = ['templates/screenshare.html?opentok-annotation'].join('');

    var windowFeatures = [
      'toolbar=no',
      'location=no',
      'directories=no',
      'status=no',
      'menubar=no',
      'scrollbars=no',
      'resizable=no',
      'copyhistory=no',
      ['width=', width].join(''),
      ['height=', height].join(''),
      ['left=', ((screen.width / 2) - (width / 2))].join(''),
      ['top=', ((screen.height / 2) - (height / 2))].join('')
    ].join(',');

    var annotationWindow = window.open(url, '', windowFeatures);
    window.onbeforeunload = function () {
      annotationWindow.close();
    };

    // External window needs access to certain globals
    annotationWindow.toolbar = toolbar;
    annotationWindow.OT = OT;
    annotationWindow.$ = $;

    annotationWindow.triggerCloseEvent = function () {
      _triggerEvent('annotationWindowClosed');
    };

    // TODO Find something better.
    var windowReady = function () {
      if (!!annotationWindow.createContainerElements) {
        $(annotationWindow.document).ready(function () {
          deferred.resolve(annotationWindow);
        });
      } else {
        setTimeout(windowReady, 100);
      }
    };

    windowReady();

    return deferred.promise();
  };

  // Remove the toolbar and cancel event listeners
  var _removeToolbar = function () {
    $(_elements.resizeSubject).off('resize', _resizeCanvas);
    toolbar.remove();
  };

  /**
   * Creates an external window (if required) and links the annotation toolbar
   * to the session
   * @param {object} session
   * @param {object} [options]
   * @param {boolean} [options.screensharing] - Using an external window
   * @param {string} [options.toolbarId] - If the container has an id other than 'toolbar'
   * @param {array} [options.items] - Custom set of tools
   * @param {array} [options.colors] - Custom color palette
   * @returns {promise} < Resolve: undefined | {object} Reference to external annotation window >
   */
  var start = function (session, options) {

    var deferred = $.Deferred();

    if (_.property('screensharing')(options)) {
      _createExternalWindow()
        .then(function (externalWindow) {
          _createToolbar(session, options, externalWindow);
          toolbar.createPanel(externalWindow);
          _triggerEvent('startAnnotation', externalWindow);
          deferred.resolve(externalWindow);
        });
    } else {
      _createToolbar(session, options);
      _triggerEvent('startAnnotation');
      deferred.resolve();
    }

    return deferred.promise();
  };

  /**
   * @param {object} pubSub - Either the publisher(sharing) or subscriber(viewing)
   * @ param {object} container - The parent container for the canvas element
   * @ param {object} options
   * @param {object} options.canvasContainer - The id of the parent for the annotation canvas
   * @param {object} [options.externalWindow] - Reference to the annotation window if publishing
   * @param {array} [options.absoluteParent] - Reference element for resize if other than container
   */
  var linkCanvas = function (pubSub, container, options) {

    /**
     * jQuery only allows listening for a resize event on the window or a
     * jQuery resizable element, like #wmsFeedWrap.  windowRefernce is a
     * reference to the popup window created for annotation.  If this doesn't
     * exist, we are watching the canvas belonging to the party viewing the
     * shared screen
     */
    _elements.resizeSubject = _.property('externalWindow')(options) || window;
    _elements.externalWindow = _.property('externalWindow')(options) || null;
    _elements.absoluteParent = _.property('absoluteParent')(options) || null;
    _elements.canvasContainer = container;


    // The canvas object
    _canvas = new OTSolution.Annotations({
      feed: pubSub,
      container: container,
      externalWindow: _elements.externalWindow
    });

    toolbar.addCanvas(_canvas);

    _canvas.onScreenCapture(function (dataUrl) {
      var win = window.open(dataUrl, '_blank');
      win.focus();
    });


    var context = _elements.externalWindow ? _elements.externalWindow : window;
    // The canvas DOM element
    _elements.canvas = $(_.first(context.document.getElementsByTagName('canvas')));

    _listenForResize();
    _resizeCanvas();
    _triggerEvent('linkAnnotation');

  };


  var resizeCanvas = function () {
    _resizeCanvas();
  };

  /**
   * Stop annotation and clean up components
   * @param {Boolean} publisher Are we the publisher?
   */
  var end = function (publisher) {
    _removeToolbar();
    _elements.canvas = null;
    if (!!publisher) {
      if (!!_elements.externalWindow) {
        _elements.externalWindow.close();
        _elements.externalWindow = null;
        _elements.resizeSubject = null;
      }
      _triggerEvent('endAnnotation');
    }
  };

  /**
   * @constructor
   * Represents an annotation component, used for annotation over video or a shared screen
   * @param {object} options
   * @param {object} options.canvasContainer - The id of the parent for the annotation canvas
   * @param {object} options.watchForResize - The DOM element to watch for resize
   */
  var AnnotationAccPack = function (options) {
    _this = this;
    _this.options = _.omit(options, 'accPack');
    _accPack = _.property('accPack')(options);
    _registerEvents();
    _setupUI();
  };

  AnnotationAccPack.prototype = {
    constructor: AnnotationAccPack,
    start: start,
    linkCanvas: linkCanvas,
    resizeCanvas: resizeCanvas,
    end: end
  };

  if (typeof exports === 'object') {
    module.exports = AnnotationAccPack;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return AnnotationAccPack;
    });
  } else {
    this.AnnotationAccPack = AnnotationAccPack;
  }

}.call(this));
