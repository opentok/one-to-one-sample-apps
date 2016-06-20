/* global AcceleratorPack CommunicationAccPack */
(function () {

  // Modules
  var _accPack;
  var _communication;

  // OpenTok session
  var _session;

  // Application State
  var _initialized = false;
  var _connected = false;
  var _callActive = false;
  var _remoteParticipant = false;
  var _viewingSharedScreen = false;
  var _callProps = {
    enableLocalAudio: true,
    enableLocalVideo: true,
    enableRemoteAudio: true,
    enableRemoteVideo: true,
  };

  // Options hash
  var _options = {
    apiKey: '', // Replace with your OpenTok API key
    sessionId: '', // Replace with a generated Session ID
    token: '', // Replace with a generated token
    screensharing: {
      extensionID: '', // Add your Chrome extension ID
      extensionPathFF: '', // Add the path to the Firefox extension
      annotation: true
    }
  };

  /** DOM Helper Methods */
  var _makePrimaryVideo = function (element) {
    $(element).addClass('primary-video');
    $(element).removeClass('secondary-video');
  };

  var _makeSecondaryVideo = function (element) {
    $(element).removeClass('primary-video');
    $(element).addClass('secondary-video');
  };

  var _viewSharedScreen = function (viewing) {

    if (viewing) {

      if (_callActive) {
        $('#videoHolderSmall').hide();
        $('#videoHolderBig').hide();
        $('#videoHolderSharedScreen').show();
        $('#toolbar').show();
        $('#feedControls').addClass('viewing-shared-screen');
      }

    } else {

      $('#videoHolderSmall').show();
      $('#videoHolderBig').show();
      $('#videoHolderSharedScreen').hide();
      $('#feedControls').removeClass('viewing-shared-screen');

    }
  };

  // Swap positions of the small and large video elements when participant joins or leaves call
  var _swapVideoPositions = function (type) {

    if (type === 'start' || type === 'joined') {

      _makePrimaryVideo('#videoHolderBig');
      _makeSecondaryVideo('#videoHolderSmall');

      /**
       * The other participant may or may not have joined the call at this point.
       */
      if (!!_remoteParticipant) {
        $('#remoteControls').show();
        $('#videoHolderBig').show();
      }

      if (_viewingSharedScreen) {
        _viewSharedScreen(true);
      }


    } else if ((type === 'end' && !!_remoteParticipant) || type === 'left') {

      _makePrimaryVideo('#videoHolderSmall');
      _makeSecondaryVideo('#videoHolderBig');

      $('#remoteControls').hide();
      $('#videoHolderBig').hide();

      if (_viewingSharedScreen) {
        $('#videoHolderSharedScreen').hide();
      }
    }

  };

  var _startCall = function () {

    // Start call
    _communication.start();
    _callActive = true;

    // Update UI
    $('#callActive').addClass('active');
    $('#videoHolderSmall').addClass('active');

    $('#enableLocalAudio').show();
    $('#enableLocalVideo').show();

    if (_remoteParticipant) {
      _swapVideoPositions('start');
    }

  };

  var _endCall = function () {

    // End call
    _communication.end();
    _callActive = false;

    // Update UI
    $('#callActive').toggleClass('active');

    $('#enableLocalAudio').hide();
    $('#enableLocalVideo').hide();

    if (_callActive || _remoteParticipant) {
      _swapVideoPositions('end');
    }

  };


  // Toggle local or remote audio/video
  var _toggleMediaProperties = function (type) {

    _callProps[type] = !_callProps[type];

    _communication[type](_callProps[type]);

    $(['#', type].join('')).toggleClass('disabled');

  };

  var _addEventListeners = function () {

    // Call events
    _accPack.registerEventListener('streamCreated', function (event) {

      if (event.stream.videoType === 'camera') {
        _remoteParticipant = true;
        if (_callActive) {
          _swapVideoPositions('joined');
        }
      }

    });

    _accPack.registerEventListener('streamDestroyed', function (event) {

      if (event.stream.videoType === 'camera') {
        _remoteParticipant = false;
        if (_callActive) {
          _swapVideoPositions('left');
        }
      }

    });

    _accPack.registerEventListener('startScreenSharing', function () {
      $('#sharingMask').show();
    });

    _accPack.registerEventListener('endScreenSharing', function () {
      $('#sharingMask').hide();
    });

    _accPack.registerEventListener('startViewingSharedScreen', function () {
      _viewSharedScreen(true);
      _viewingSharedScreen = true;
    });

    _accPack.registerEventListener('endViewingSharedScreen', function () {
      _viewSharedScreen(false);
    });

    // Click events for enabling/disabling audio/video
    var controls = [
      'enableLocalAudio',
      'enableLocalVideo',
      'enableRemoteAudio',
      'enableRemoteVideo'
    ];
    controls.forEach(function (control) {
      $(['#', control].join('')).on('click', function () {
        _toggleMediaProperties(control);
      });
    });
  };

  var _init = function () {

    var accPackOptions = _.pick(_options, ['apiKey', 'sessionId', 'token', 'screensharing']);

    _accPack = new AcceleratorPack(accPackOptions);
    _session = _accPack.getSession();
    _.extend(_options, _accPack.getOptions());

    _session.on({
      connectionCreated: function () {

        if (_connected) {
          return;
        }

        _connected = true;

        var commOptions = _.extend({}, _options, {
          session: _session,
          accPack: _accPack
        }, _accPack.getOptions());

        _communication = new CommunicationAccPack(commOptions);
        _addEventListeners();
        _initialized = true;
        _startCall();
      }
    });
  };

  var _connectCall = function () {

    if (!_initialized) {
      _init();
    } else {
      _callActive ? _endCall() : _startCall();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    $('#callActive').on('click', _connectCall);
  });

}());
