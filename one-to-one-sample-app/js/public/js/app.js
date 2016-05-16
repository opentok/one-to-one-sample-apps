var app = (function() {

  // Modules
  var _communication;

  // OpenTok session
  var _session;

  // Application State
  var _connected = false;
  var _callActive = false;
  var _remoteParticipant = false;
  var _callProps = {
    enableLocalAudio: true,
    enableLocalVideo: true,
    enableRemoteAudio: true,
    enableRemoteVideo: true,
  };

  // Options hash
  var _options = {
    apiKey: '', // Replace with your OpenTok API key 
    sessionId: '', //Replace with a generated Session ID
    token: '', //Replace with a generated token
    localCallProperties: {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      showControls: false,
      style: {
        buttonDisplayMode: 'off'
      }
    }
  };

  /** DOM Helper Methods */
  var _makePrimaryVideo = function(element) {
    $(element).addClass('primary-video');
    $(element).removeClass('secondary-video');
  }

  var _makeSecondaryVideo = function(element) {
    $(element).removeClass('primary-video');
    $(element).addClass('secondary-video');
  }

  // Swap positions of the small and large video elements when participant joins or leaves call
  var _swapVideoPositions = function(type) {

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

    } else if ((type === 'end' && !!_remoteParticipant) || type === 'left') {

      _makePrimaryVideo('#videoHolderSmall');
      _makeSecondaryVideo('#videoHolderBig');

      $('#remoteControls').hide();
      $('#videoHolderBig').hide();
    }

  };

  // Toggle local or remote audio/video
  var _toggleMediaProperties = function(type) {

    _callProps[type] = !_callProps[type];

    _communication[type](_callProps[type]);

    $('#' + type).toggleClass('disabled');

  };

  var _addEventListeners = function() {

    // Call events
    _session.on('streamCreated', function(event) {

      if (event.stream.videoType === 'camera') {
        _remoteParticipant = true;
        _callActive && _swapVideoPositions('joined');
      }

    });

    _session.on('streamDestroyed', function(event) {

      if (event.stream.videoType === 'camera') {
        _remoteParticipant = false;
        _callActive && _swapVideoPositions('left');
      }

    });

    // Start or end call
    $('#callActive').on('click', _connectCall);

    // Click events for enabling/disabling audio/video
    var controls = ['enableLocalAudio', 'enableLocalVideo', 'enableRemoteAudio', 'enableRemoteVideo'];
    controls.forEach(function(control) {
      $('#' + control).on('click', function() {
        _toggleMediaProperties(control)
      })
    });
  };

  var _startCall = function() {

    // Start call
    _communication.start();
    _callActive = true;

    // Update UI
    $('#callActive').addClass('active');
    $('#videoHolderSmall').addClass('active');

    $('#enableLocalAudio').show();
    $('#enableLocalVideo').show();

    _remoteParticipant && _swapVideoPositions('start');
  };

  var _endCall = function() {

    // End call
    _communication.end();
    _callActive = false;

    // Update UI
    $('#callActive').toggleClass('active');

    $('#enableLocalAudio').hide();
    $('#enableLocalVideo').hide();

    !!(_callActive || _remoteParticipant) && _swapVideoPositions('end');
  };

  var _connectCall = function() {

    !_callActive ? _startCall() : _endCall();

  };

  var init = function() {

    // Get session
    _session = OT.initSession(_options.apiKey, _options.sessionId);

window.mySession = _session;
    // Connect
    _session.connect(_options.token, function(error) {
      if (error) {
        console.log('Session failed to connect');
      } else {
        _connected = true;
        _communication = new CommunicationAccPack(_.extend(_options, {
          session: _session,
          localCallProperties: _options.localCallProperties
        }));
        _addEventListeners();
      }
    });

  };

  return init;
})();

app();