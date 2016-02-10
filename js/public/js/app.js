
var AV = (function(){

	var App = function(){}

	var _options

	var _apiKey = '100';
	var _sessionId = '2_MX4xMDB-fjE0NTUxMzMzMTg1NTJ-VHpJU0dKaEpZbENhNTNMZ25sNWs5SURYfn4';
	var _token = 'T1==cGFydG5lcl9pZD0xMDAmc2RrX3ZlcnNpb249dGJwaHAtdjAuOTEuMjAxMS0wNy0wNSZzaWc9YWI2ZjM0YTU2YzBjNmVlMmM0MTUxYTRjZTIyOTUzNWRjYTU0YTY0ZDpzZXNzaW9uX2lkPTJfTVg0eE1EQi1makUwTlRVeE16TXpNVGcxTlRKLVZIcEpVMGRLYUVwWmJFTmhOVE5NWjI1c05XczVTVVJZZm40JmNyZWF0ZV90aW1lPTE0NTUxMzE0Mzkmcm9sZT1wdWJsaXNoZXImbm9uY2U9MTQ1NTEzMTQzOS4yMDQ4MTI0NTIwNTg3MiZleHBpcmVfdGltZT0xNDU3NzIzNDM5';
	var _session;
	var _container = document.getElementById('main-container');

    var options = {
           apiKey: _apiKey,
           sessionId: _sessionId,
           token: _token,
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

	// _container.onclick = function(e){
	// 	alert('clicked'); 
	// };


	App.prototype.init = function(){

		var self = this;

		this.options = options;
		this.options.publishers = {};
		this.options.subscribers = [];
		this.options.session = OT.initSession(options.apiKey, options.sessionId);
		this.options.session.connect(this.options.token, function(error) {
			if ( error ) { console.log('Session failed to connect')};

			self.startCall(this.options);

		})

	};

	App.prototype.startCall = function (options) {

		this._call = new Call(this.options);
		this._call.start();
	};

	return App;

})();

var myApp = new AV();

myApp.init();

