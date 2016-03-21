var app = (function() {

    // Call component
    var _call;

    var _options = {
        apiKey: '100',
        sessionId: '2_MX4xMDB-fjE0NTc1NTU4Mjk4NDN-M0RvR0JjMFlUSFp1SkdzbUZzRmd4UEhmfn4',
        token: 'T1==cGFydG5lcl9pZD0xMDAmc2RrX3ZlcnNpb249dGJwaHAtdjAuOTEuMjAxMS0wNy0wNSZzaWc9NjY4MGIzMzNhNjg2YjViMDAzYTkxNjYyMjM2ZTM3NGMzZjEwMjM4NTpzZXNzaW9uX2lkPTJfTVg0eE1EQi1makUwTlRjMU5UVTRNams0TkROLU0wUnZSMEpqTUZsVVNGcDFTa2R6YlVaelJtZDRVRWhtZm40JmNyZWF0ZV90aW1lPTE0NTc1NTM4Mzgmcm9sZT1tb2RlcmF0b3Imbm9uY2U9MTQ1NzU1MzgzOC4yMjcyMTk2ODgxMjAwOCZleHBpcmVfdGltZT0xNDYwMTQ1ODM4',
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
        startEndCall: document.getElementById('callActive'),
        localVideo: document.getElementById('videoHolderSmall'),
        remoteVideo: document.getElementById('videoHolderBig'),
        remoteControls: document.getElementById('remoteControls'),
        enableLocalAudio: document.getElementById('enableLocalAudio'),
        enableLocalVideo: document.getElementById('enableLocalVideo'),
        enableRemoteAudio: document.getElementById('enableRemoteAudio'),
        enableRemoteVideo: document.getElementById('enableRemoteVideo')
    };

    var _callProperties = {
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

            _toggleClass(_callElements.localVideo, 'secondary-video');
            _toggleClass(_callElements.localVideo, 'primary-video');
            _toggleClass(_callElements.remoteVideo, 'secondary-video');
            _toggleClass(_callElements.remoteVideo, 'primary-video');

            _show(_callElements.remoteControls);


        } else if (type === 'end' || type === 'left') {

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

    var _addEventListeners = function() {

        // Call events
        _call.onParticipantJoined = function(event) {

            // Not doing anything with the event
            _callProperties.remoteParticipant = true;
            _callProperties.callActive && _swapVideoPositions('joined');

        };

        _call.onParticipantLeft = function(event) {
            // Not doing anything with the event  
            _callProperties.remoteParticipant = false;
            _callProperties.callActive && _swapVideoPositions('left');

        };

        // Start or end call
        _callElements.startEndCall.onclick = _connectCall;

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
        _call.start();
        _callProperties.callActive = true;


        // Update UI
        [_callElements.startEndCall, _callElements.localVideo].forEach(function(element) {
            _updateClassList(element, 'active', true);
        })

        _show(_callElements.enableLocalAudio, _callElements.enableLocalVideo);

        _callProperties.remoteParticipant && _swapVideoPositions('start');
    };

    var _endCall = function() {

        // End call
        _call.end();
        _callProperties.callActive = false;

        // Update UI    
        _toggleClass(_callElements.startEndCall, 'active');

        _hide(_callElements.enableLocalAudio, _callElements.enableLocalVideo);

        !!(_callProperties.callActive || _callProperties.remoteParticipant) && _swapVideoPositions('end');
    };

    var _connectCall = function() {

        !_callProperties.callActive ? _startCall() : _endCall();

    };

    var init = function() {

        // Get session
        _options.session = OT.initSession(_options.apiKey, _options.sessionId);

        // Connect
        _options.session.connect(_options.token, function(error) {
            if (error) {
                console.log('Session failed to connect');
            } else {
                _call = new Call(_options)
                _addEventListeners();
            }
        });

    };

    return init;

})();

app();