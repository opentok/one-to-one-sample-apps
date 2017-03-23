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
