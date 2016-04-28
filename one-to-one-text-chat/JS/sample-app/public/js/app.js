var app = (function() {

  // Sample component
  var _communication;
  var _acceleratorPack;
  var _otkanalyticsData;
  var _loggingData;

  var _options = {
    apiKey: '',
    sessionId: '',
    token: '',
    publishers: {},
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
    //vars for the analytics logs. Internal use
    clientVersion: 'js-vsol-0.9',
    source: 'one_to_one_textchat_sample_app',
    actionInitialize: 'initialize', 
    actionStartComm: 'start_comm',
    actionEndComm: 'end_comm',
    variationAttempt: 'Attempt',
    variationError: 'Failure',
    variationSuccess: 'Success'
  };

  var _communicationElements = {
    startEndCall: document.getElementById('callActive'),
    localVideo: document.getElementById('videoHolderSmall'),
    remoteVideo: document.getElementById('videoHolderBig'),
    remoteControls: document.getElementById('remoteControls'),
    enableLocalAudio: document.getElementById('enableLocalAudio'),
    enableLocalVideo: document.getElementById('enableLocalVideo'),
    enableRemoteAudio: document.getElementById('enableRemoteAudio'),
    enableRemoteVideo: document.getElementById('enableRemoteVideo'),
    enableTextChat: document.getElementById('enableTextChat')
  };

  var _communicationProperties = {
    callActive: false,
    remoteParticipant: false,
    enableLocalAudio: true,
    enableLocalVideo: true,
    enableRemoteAudio: true,
    enableRemoteVideo: true
  };

  // DOM helper functions
  var _show = function() {

    elements = Array.prototype.slice.call(arguments);

    elements.forEach(function(element) {
      element.classList.remove('hidden');
    });
  };

  var _hide = function() {

    elements = Array.prototype.slice.call(arguments);

    elements.forEach(function(element) {
      element.classList.add('hidden');
    });
  };

  var _updateClassList = function(element, className, add) {
    element.classList[add ? 'add' : 'remove'](className);
  };

  var _toggleClass = function(element, className) {
    element.classList.toggle(className);
  };

  // Swap positions of the small and large video elements when participant joins or leaves call
  var _swapVideoPositions = function(type) {

    if (type === 'start' || type === 'joined') {

      _toggleClass(_communicationElements.localVideo, 'secondary-video');
      _toggleClass(_communicationElements.localVideo, 'primary-video');
      _toggleClass(_communicationElements.remoteVideo, 'secondary-video');
      _toggleClass(_communicationElements.remoteVideo, 'primary-video');

      _show(_communicationElements.remoteControls);


    } else if (type === 'end' || type === 'left') {

      _toggleClass(_communicationElements.remoteVideo, 'secondary-video');
      _toggleClass(_communicationElements.remoteVideo, 'primary-video');
      _toggleClass(_communicationElements.localVideo, 'secondary-video');
      _toggleClass(_communicationElements.localVideo, 'primary-video');

      _hide(_communicationElements.remoteControls);

    }

  };

  // Toggle local or remote audio/video
  var _toggleMediaProperties = function(type) {

    _communicationProperties[type] = !_communicationProperties[type];

    _communication[type](_communicationProperties[type]);

    _updateClassList(_communicationElements[type], 'disabled', !_communicationProperties[type]);

  };

  var _addEventListeners = function() {

    // Call events
    _communication.onParticipantJoined = function(event) {

      // Not doing anything with the event
      _communicationProperties.remoteParticipant = true;
      _communicationProperties.callActive && _swapVideoPositions('joined');

    };

    _communication.onParticipantLeft = function(event) {
      // Not doing anything with the event
      _communicationProperties.remoteParticipant = false;
      _communicationProperties.callActive && _swapVideoPositions('left');

    };

    // Start or end call
    _communicationElements.startEndCall.onclick = _connectCall;

    // Start or end text chat
    _communicationElements.enableTextChat.onclick = function(){
      _acceleratorPack.connectTextChat();
    };

    // Click events for enabling/disabling audio/video
    var controls = ['enableLocalAudio', 'enableLocalVideo', 'enableRemoteAudio', 'enableRemoteVideo'];
    controls.forEach(function(control) {
      document.getElementById(control).onclick = function() {
        _toggleMediaProperties(control);
      };
    });
  };

  var _startCall = function() {

    // Start call
    _communication.start();
    _communicationProperties.callActive = true;


    // Update UI
    [_communicationElements.startEndCall, _communicationElements.localVideo].forEach(function(element) {
      _updateClassList(element, 'active', true);
    });

    _show(_communicationElements.enableLocalAudio, _communicationElements.enableLocalVideo, _communicationElements.enableTextChat);

    _communicationProperties.remoteParticipant && _swapVideoPositions('start');
  };

  var _endCall = function() {

    // End call
    _communication.end();
    _communicationProperties.callActive = false;

    // Update UI
    _toggleClass(_communicationElements.startEndCall, 'active');

    _hide(_communicationElements.enableLocalAudio, _communicationElements.enableLocalVideo, _communicationElements.enableTextChat);

    !!(_communicationProperties.callActive || _communicationProperties.remoteParticipant) && _swapVideoPositions('end');
  };

  var _connectCall = function() {

    !_communicationProperties.callActive ? _startCall() : _endCall();

  };

  var init = function() {
    // Get session
    _acceleratorPack = new AcceleratorPack(
      {
        textChat: {
          sessionInfo: {apikey: _options.apiKey, sessionId: _options.sessionId, token: _options.token},
          user: {
            alias: "user1"
          },
          charCountElement: "#character-count"
        }
      });
    _options.session = _acceleratorPack.getSession();

    _options.session.on({
      connectionCreated: function (event) {
        _communication = new Communication(_options);
        _communication.addLog(_options.actionInitialize, _options.variationAttempt);
        _communication.addLog(_options.actionInitialize, _options.variationSuccess);
        _addEventListeners();
      },
      connectionError: function (event) {
        _communication.addLog(_options.actionInitialize, _options.variationError);
      }
    });
  };

  return init;
})();
app();