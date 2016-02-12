
var app = (function(){

	var _apiKey = '100';
	var _sessionId = '2_MX4xMDB-fjE0NTUxMzMzMTg1NTJ-VHpJU0dKaEpZbENhNTNMZ25sNWs5SURYfn4';
	var _token = 'T1==cGFydG5lcl9pZD0xMDAmc2RrX3ZlcnNpb249dGJwaHAtdjAuOTEuMjAxMS0wNy0wNSZzaWc9YWI2ZjM0YTU2YzBjNmVlMmM0MTUxYTRjZTIyOTUzNWRjYTU0YTY0ZDpzZXNzaW9uX2lkPTJfTVg0eE1EQi1makUwTlRVeE16TXpNVGcxTlRKLVZIcEpVMGRLYUVwWmJFTmhOVE5NWjI1c05XczVTVVJZZm40JmNyZWF0ZV90aW1lPTE0NTUxMzE0Mzkmcm9sZT1wdWJsaXNoZXImbm9uY2U9MTQ1NTEzMTQzOS4yMDQ4MTI0NTIwNTg3MiZleHBpcmVfdGltZT0xNDU3NzIzNDM5';

	// Call component
  var _call;

  var _options = {
    apiKey: _apiKey,
    sessionId: _sessionId,
    token: _token,
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
    }
  };

  var _callElements = {
    startEndCall      : document.getElementById('callActive'),
    localVideo        : document.getElementById('videoHolderSmall'),
    remoteVideo       : document.getElementById('videoHolderBig'),
    remoteControls    : document.getElementById('remoteControls'),
    enableLocalAudio  : document.getElementById('enableLocalAudio'),
    enableLocalVideo  : document.getElementById('enableLocalVideo'),
    enableRemoteAudio : document.getElementById('enableRemoteAudio'),
    enableRemoteVideo : document.getElementById('enableRemoteVideo')
  };

  var _callProperties = {
    callActive          : false,
    remoteParticipant   : false,
    enableLocalAudio    : true,
    enableLocalVideo    : true,
    enableRemoteAudio   : true,
    enableRemoteVideo   : true
  };


  // DOM helper functions
  var _show = function (element) {
    element.classList.remove('hidden');
  };

  var _hide = function (element) {
    element.classList.add('hidden');
  };

  var _updateClassList = function (element, className, add) {
    element.classList[add ? 'add' : 'remove'](className);
  };

  var _toggleClass = function(element, className) {
    element.classList.toggle(className);
  };

    // Swap positions of the small and large video elements when participant joins or leaves call 
    var _swapVideoPositions = function(type) {

    	if ( type === 'start' || type === 'joined' ) {

        _toggleClass(_callElements.localVideo, 'secondary-video');
        _toggleClass(_callElements.localVideo, 'primary-video');
        _toggleClass(_callElements.remoteVideo, 'secondary-video');
        _toggleClass(_callElements.remoteVideo, 'primary-video');

        _show(_callElements.remoteControls);


    	} else if ( type === 'end' || type === 'left') {

        _toggleClass(_callElements.remoteVideo, 'secondary-video');
        _toggleClass(_callElements.remoteVideo, 'primary-video');
        _toggleClass(_callElements.localVideo, 'secondary-video');
        _toggleClass(_callElements.localVideo, 'primary-video');

        _hide(_callElements.remoteControls);

    	} 

    };

    // Toggle local or remote audio/video
    var _toggleMediaProperties = function(type) {

      _callProperties[type] = !_callProperties[type];
      
      _call[type](_callProperties[type]);

      _updateClassList(_callElements[type], 'disabled', !_callProperties[type]);  

    };

    var _initCall = function() {
      _call = new Call(_options);
    };

    var _addEventListeners = function () {

      // Call events
      _call.onParticipantJoined = function (event) { 

        // Not doing anything with the event
        _callProperties.remoteParticipant = true;
        _callProperties.callActive && _swapVideoPositions('joined');
      
      };

      _call.onParticipantLeft = function (event) { 
        // Not doing anything with the event  
        _callProperties.remoteParticipant = false;
        _callProperties.callActive && _swapVideoPositions('left');
      
      };

      // Click events for enabling/disabling local/remote audio/video
      Object.keys(_callProperties).forEach(function(control) {
        if ( control.slice(0,6) !== 'enable' ) { return; }
        document.getElementById(control).onclick = function(){ _toggleMediaProperties(control); };
      });

      // Start or end call
      _callElements.startEndCall.onclick = _connectCall;

    };

  var _startCall = function () {
    
    // Start call
    _call.start();    
    _callProperties.callActive = true;


    // Update UI
    [_callElements.startEndCall, _callElements.localVideo].forEach(function(element) {
      _updateClassList(element, 'active', true);
    })

    // !!_call._options.subscribers.length && _swapVideoPositions('start');
    _callProperties.remoteParticipant && _swapVideoPositions('start');
  };

  var _endCall = function () {
    _call.end();
    _callProperties.callActive = false;
    _toggleClass(_callElements.startEndCall, 'active');
    !!(_callProperties.callActive || _callProperties.remoteParticipant) && _swapVideoPositions('end');
  };

  var _connectCall = function() {

    !_callProperties.callActive ? _startCall() : _endCall();
  
  };

	var init = function(){

    // Get session
		_options.session = OT.initSession(_options.apiKey, _options.sessionId);

    // Connect
		_options.session.connect(_options.token, function(error) {
      if ( error ) { 
        console.log('Session failed to connect');
      } else {
        _initCall(_options);
        _addEventListeners();
      }
		});

	};

  return init;

})();

app();

