var AcceleratorPack = (function() {

  var _textChat;
  var _session, self;
  var _isConnected = false;
  var _apiKey;

  // Constructor
  var AcceleratorPackLayer = function (options) {
    // Get session
    _session = OT.initSession(options.textChat.sessionInfo.apikey, options.textChat.sessionInfo.sessionId);
    self = this;
    _apiKey = options.textChat.sessionInfo.apikey;
    // Connect
    _session.connect(options.textChat.sessionInfo.token, function(error) {
      if (error) {
        console.log('Session failed to connect');
      } else {
        if(TextChatAccPack)
        {
          options.textChat.user.id = _session.id ;
          _textChat = new TextChatAccPack(
            {
              charCountElement: options.textChat.charCountElement,
              acceleratorPack: self,
              sender: options.textChat.user,
              limitCharacterMessage: options.textChat.limitCharacterMessage
            });
        }
        _isConnected = true;
      }
    });
  };

  AcceleratorPackLayer.prototype = {
    constructor: AcceleratorPack,

    getSession: function(){
      return _session;
    },

    getApiKey: function(){
      return _apiKey;
    },

    connectTextChat: function() {
      if(_textChat.getEnableTextChat()){
        if(_textChat.getDisplayTextChat())
          _textChat.hideTextChat();
        else
          _textChat.showTextChat();
      }
      else{
        _textChat.initTextChat("#chat-container");
      }
    },
  };
  return AcceleratorPackLayer;
})();