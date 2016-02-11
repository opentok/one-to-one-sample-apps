
var app = (function(){

	var _options

	var _apiKey = '100';
	var _sessionId = '2_MX4xMDB-fjE0NTUxMzMzMTg1NTJ-VHpJU0dKaEpZbENhNTNMZ25sNWs5SURYfn4';
	var _token = 'T1==cGFydG5lcl9pZD0xMDAmc2RrX3ZlcnNpb249dGJwaHAtdjAuOTEuMjAxMS0wNy0wNSZzaWc9YWI2ZjM0YTU2YzBjNmVlMmM0MTUxYTRjZTIyOTUzNWRjYTU0YTY0ZDpzZXNzaW9uX2lkPTJfTVg0eE1EQi1makUwTlRVeE16TXpNVGcxTlRKLVZIcEpVMGRLYUVwWmJFTmhOVE5NWjI1c05XczVTVVJZZm40JmNyZWF0ZV90aW1lPTE0NTUxMzE0Mzkmcm9sZT1wdWJsaXNoZXImbm9uY2U9MTQ1NTEzMTQzOS4yMDQ4MTI0NTIwNTg3MiZleHBpcmVfdGltZT0xNDU3NzIzNDM5';
	var _session;
	var _myVideo = document.getElementById('videoHolderSmall')
	var _theirVideo = document.getElementById('videoHolderBig')
  var _call;
  var toggleCall = document.getElementById('start-end-call');

  _callProperties = {};
  _callElements = {
    toggleLocalAudio: document.getElementById('toggle-local-audio'),
    toggleLocalVideo: document.getElementById('toggle-local-video')   
  };

  var options = {
         apiKey: _apiKey,
         sessionId: _sessionId,
         token: _token,
         publishers: {},
         subscribers: [],
         streams: [],
         onWMSStarted: function() {
             console.log('AV Solution widget STARTED');
         },
         onWMSEnded: function() {
             console.log('Wealth Management Solution widget ENDED');
         },
         onWMSError: function(error) {
             console.log('There is an error loading the Wealth Management Solution widget: ' + error.message);
         },
         el: document.getElementById('video-container'),
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

    var _swapVideoPositions = function(event, type) {

    	if ( type === 'joined') {
    		
    		_myVideo.classList.add('secondary-video');
    		_myVideo.classList.remove('primary-video');

    		_theirVideo.classList.remove('secondary-video');
    		_theirVideo.classList.add('primary-video');

    	} else if ( type === 'left') {
    		
    		_theirVideo.classList.add('secondary-video');
    		_theirVideo.classList.remove('primary-video');

    		_myVideo.classList.remove('secondary-video');
    		_myVideo.classList.add('primary-video');

    	} 

    };

    var _toggleMediaProperties = function(type) {

      _callProperties[type] = !_callProperties[type];

      var enabled = _callProperties[type]
      _call['enable' + type](enabled);

      _callElements['toggle' + type].classList[!enabled ? 'add' : 'remove']('disabled');

    };

    // var _toggleAudioVideo = function () {
    //   _call.enableLocalAudio(false) 
    // }

    var _initCall = function(options) {
      
      window._call = _call = new Call(options);

      var props = ['LocalAudio', 'LocalVideo', 'RemoteAudio', 'RemoteVideo'];
      props.forEach(function(prop){ _callProperties[prop] = true;})
      _callProperties.active = false;

    };

    var _addEventListeners = function () {
      toggleCall.onclick = _connectCall;
      _callElements.toggleLocalAudio.onclick = function() { _toggleMediaProperties('LocalAudio'); }
      _callElements.toggleLocalVideo.onclick = function() { _toggleMediaProperties('LocalVideo'); }
      // toggleRemoteAudio.onclick = _toggleMedia.call('LocalVideo');
      // toggleRemoteVideo.onclick = _toggleMedia.call('LocalVideo');
      // toggleCallButton.onclick = _connectCall;
    };

    var _startCall = function () {
      _call.start();
      _callProperties.active = true;
      toggleCall.classList.add('active');
      _call.onParticipantJoined = function (event) { _swapVideoPositions(event, 'joined'); }
      _call.onParticipantLeft = function (event) { _swapVideoPositions(event, 'left'); }
    };

    var _endCall = function () {
      _call.end();
      _callProperties.active = false;
      toggleCall.classList.remove('active');
    };

    var _connectCall = function() {

      !_callProperties.active ? _startCall() : _endCall();
    
    };

	var init = function(){

		var self = this;

		this.options = options;
		this.options.session = OT.initSession(options.apiKey, options.sessionId);
		this.options.session.connect(this.options.token, function(error) {
			
      if ( error ) { 
        console.log('Session failed to connect');
      } else {
        _initCall(self.options);
        _addEventListeners();
      }

		})

	};

  return {init: init};

	// App.prototype.startCall = function () {
 //    _initCall(this.options);
	// 	_call.start();
	// };

	// return App;

})();



app.init();

