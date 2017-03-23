/* global OTKAnalytics define */
(function () {

  /** Include external dependencies */

  var _;
  var $;
  var OTKAnalytics;

  if (typeof module === 'object' && typeof module.exports === 'object') {
    /* eslint-disable import/no-unresolved */
    _ = require('underscore');
    $ = require('jquery');
    window.jQuery = $;
    window.moment = require('moment');
    require('kuende-livestamp');
    OTKAnalytics = require('opentok-solutions-logging');
    /* eslint-enable import/no-unresolved */
  } else {
    _ = this._;
    $ = this.$;
    window.jQuery = $;
    window.moment = this.moment;
    OTKAnalytics = this.OTKAnalytics;
  }


  // Reference to instance of TextChatAccPack
  var _this;
  var _session;

  /** Analytics */
  var _otkanalytics;

  var _logEventData = {
    // vars for the analytics logs. Internal use
    clientVersion: 'js-vsol-2.0.0',
    componentId: 'textChatAccPack',
    name: 'guidTextChatAccPack',
    actionInitialize: 'Init',
    actionStart: 'Start',
    actionEnd: 'End',
    actionOpen: 'OpenTC',
    actionClose: 'CloseTC',
    actionSendMessage: 'SendMessage',
    actionReceiveMessage: 'ReceiveMessage',
    actionSetMaxLength: 'SetMaxLength',
    variationAttempt: 'Attempt',
    variationError: 'Failure',
    variationSuccess: 'Success'
  };


  var _logAnalytics = function () {

    // init the analytics logs
    var _source = window.location.href;

    var otkanalyticsData = {
      clientVersion: _logEventData.clientVersion,
      source: _source,
      componentId: _logEventData.componentId,
      name: _logEventData.name
    };

    _otkanalytics = new OTKAnalytics(otkanalyticsData);

    var sessionInfo = {
      sessionId: _session.id,
      connectionId: _session.connection.connectionId,
      partnerId: _session.apiKey
    };

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

  // State vars
  var _enabled = false;
  var _displayed = false;
  var _initialized = false;
  var _controlAdded = false;
  var _sender;
  var _composer;
  var _lastMessage;
  var _newMessages;
  var _sentMessageHistory = [];
  var _remoteParticipant = false;

  // Reference to Accelerator Pack Common Layer
  var _accPack;

  var _triggerEvent = function (event, data) {
    _accPack && _accPack.triggerEvent(event, data);
  };

  // Private methods
  var renderUILayout = function () {
    var deliveryMessage =
      _this.options.waitingMessage || 'Messages will be delivered once your contact arrives';
    /* eslint-disable max-len, prefer-template */
    return [
      '<div class="ots-text-chat-container">',
      '<div class="ots-text-chat">',
      '<div class="ots-messages-header ots-hidden" id="chatHeader">',
      '<span>Chat with</span>',
      '</div>',
      '<div id="otsChatWrap">',
      '<div class="ots-messages-holder" id="messagesHolder">',
      '<div class="ots-messages-alert ots-hidden" id="messagesWaiting">' + deliveryMessage + '</div>',
      '<div class="ots-message-item ots-message-sent">',
      '</div>',
      '</div>',
      '<div class="ots-send-message-box">',
      '<input type="text" maxlength=' + _this.options.limitCharacterMessage + ' class="ots-message-input" placeholder="Enter your message here" id="messageBox">',
      '<button class="ots-icon-check" id="sendMessage" type="submit"></button>',
      '<div class="ots-character-count"><span><span id="characterCount">0</span>/' + _this.options.limitCharacterMessage + ' characters</span></div>',
      '</div>',
      '</div>',
      '</div>',
      '</div>'
    ].join('\n');
    /* eslint-enable max-len, prefer-template */
  };

  var _shouldAppendMessage = function (data) {

    if (_lastMessage) {
      return _lastMessage.sender.id === data.sender.id && _lastMessage.sender.id === data.sender.id;
    }

    return false;

  };

  var _cleanComposer = function () {
    _composer.value = '';
    $('#characterCount').text('0');
  };

  var _getBubbleHtml = function (message) {
    /* eslint-disable max-len, prefer-template */
    var bubble = [
      '<div class="' + message.messageClass + '" >',
      '<div class="ots-user-name-initial"> ' + message.username[0] + '</div>',
      '<div class="ots-item-timestamp"> ' + message.username + ', <span data-livestamp=" ' + new Date(message.time) + '" </span></div>',
      '<div class="ots-item-text">',
      '<span> ' + message.message + '</span>',
      '</div>',
      '</div>'
    ].join('\n');
    /* eslint-enable max-len, prefer-template */
    return bubble;
  };

  var _renderChatMessage = function (messageSenderId, messageSenderAlias, message, sentOn) {

    var sentByClass = _sender.id === messageSenderId ?
      'ots-message-item ots-message-sent' :
      'ots-message-item';

    var view = _getBubbleHtml({
      username: messageSenderAlias,
      message: message,
      messageClass: sentByClass,
      time: sentOn
    });

    var chatholder = $(_newMessages);
    chatholder.append(view);
    _cleanComposer();
    chatholder[0].scrollTop = chatholder[0].scrollHeight;

  };

  var _handleMessageSent = function (data) {
    if (_shouldAppendMessage(data)) {
      $('.ots-item-text').last().append(['<span>', data.message, '</span>'].join(''));
      var chatholder = $(_newMessages);
      chatholder[0].scrollTop = chatholder[0].scrollHeight;
      _cleanComposer();

    } else {
      _renderChatMessage(_sender.id, _sender.alias, data.message, data.sentOn);
    }
    _lastMessage = data;

    _triggerEvent('messageSent', data);

  };

  var _handleMessageError = function (error) {
    console.log(error.code, error.message);
    if (error.code === 500) {
      var view = _.template($('#chatError').html());
      $(_this.comms_elements.messagesView).append(view());
    }
    _triggerEvent('errorSendingMessage', error);
  };

  var _showWaitingMessage = function () {
    var el = document.getElementById('messagesWaiting');
    el && el.classList.remove('ots-hidden');
    var parent = document.getElementById('messagesHolder');
    parent && parent.classList.add('has-alert');
  };

  var _hideWaitingMessage = function () {
    var el = document.getElementById('messagesWaiting');
    el && el.classList.add('ots-hidden');
    var parent = document.getElementById('messagesHolder');
    parent && parent.classList.add('has-alert');
  };

  var _sendMessage = function (recipient, message) {

    var deferred = new $.Deferred();

    _sentMessageHistory.push({ recipient: recipient, message: message });
    if (!_remoteParticipant) {
      _showWaitingMessage();
      deferred.resolve();
    } else {
      _hideWaitingMessage();
    }

    var messageData = {
      text: message,
      sender: {
        id: _sender.id,
        alias: _sender.alias,
      },
      sentOn: Date.now()
    };

    // Add SEND_MESSAGE attempt log event
    _log(_logEventData.actionSendMessage, _logEventData.variationAttempt);

    if (recipient === undefined) {
      _session
        .signal({
          type: 'text-chat',
          data: JSON.stringify(messageData)
        }, function (error) {
          if (error) {
            var errorMessage = 'Error sending a message. ';
            // Add SEND_MESSAGE failure log event
            _log(_logEventData.actionSendMessage, _logEventData.variationFailure);
            if (error.code === 413) {
              errorMessage += 'The chat message is over size limit.';
            } else {
              if (error.code === 500) {
                errorMessage += 'Check your network connection.';
              }
            }
            deferred.reject(_.extend(_.omit(error, 'message')), {
              message: errorMessage
            });
          } else {
            console.log('Message sent');
            // Add SEND_MESSAGE success log event
            _log(_logEventData.actionSendMessage, _logEventData.variationSuccess);
            deferred.resolve(messageData);
          }
        });
    } else {
      _session.signal({
        type: 'text-chat',
        data: JSON.stringify(messageData),
        to: recipient
      }, function (error) {
        if (error) {
          console.log('Error sending a message');
          _log(_logEventData.actionSendMessage, _logEventData.variationFailure);
          deferred.resolve(error);
        } else {
          console.log('Message sent');
          deferred.resolve(messageData);
          _log(_logEventData.actionSendMessage, _logEventData.variationSuccess);
        }
      });
    }

    return deferred.promise();
  };

  var _sendTxtMessage = function (text) {
    if (!_.isEmpty(text)) {
      $.when(_sendMessage(_this._remoteParticipant, text))
        .then(function () {
          _handleMessageSent({
            sender: {
              id: _sender.id,
              alias: _sender.alias
            },
            message: text,
            sentOn: Date.now()
          });
          if (this.futureMessageNotice) {
            this.futureMessageNotice = false;
          }
        }, function (error) {
          _handleMessageError(error);
        });
    }
  };

  var _setupUI = function () {

    // Add INITIALIZE success log event
    _log(_logEventData.actionInitialize, _logEventData.variationAttempt);

    var parent = document.querySelector(_this.options.textChatContainer) || document.body;

    var chatView = document.createElement('section');
    chatView.innerHTML = renderUILayout();

    _composer = chatView.querySelector('#messageBox');

    _newMessages = chatView.querySelector('#messagesHolder');

    _composer.onkeyup = function updateCharCounter() {
      $('#characterCount').text(_composer.value.length);
      if (_composer.value.length !== 0) {
        $('.ots-icon-check').addClass('active');
      } else {
        $('.ots-icon-check').removeClass('active');
      }
    };

    _composer.onkeydown = function controlComposerInput(event) {
      var isEnter = (event.which === 13 || event.keyCode === 13);
      if (!event.shiftKey && isEnter) {
        event.preventDefault();
        _sendTxtMessage(_composer.value);
      }
    };

    parent.appendChild(chatView);

    document.getElementById('sendMessage').onclick = function () {
      _sendTxtMessage(_composer.value);
    };
    // Add INITIALIZE success log event
    _log(_logEventData.actionInitialize, _logEventData.variationSuccess);
  };

  var _onIncomingMessage = function (signal) {
    _log(_logEventData.actionReceiveMessage, _logEventData.variationAttempt);
    var data = JSON.parse(signal.data);

    if (_shouldAppendMessage(data)) {
      $('.ots-item-text').last().append(['<span>', data.text, '</span>'].join(''));
    } else {
      _renderChatMessage(data.sender.id, data.sender.alias, data.text, data.sentOn);
    }

    _lastMessage = data;
    _log(_logEventData.actionReceiveMessage, _logEventData.variationSuccess);
  };

  var _handleTextChat = function (event) {
    var me = _session.connection.connectionId;
    var from = event.from.connectionId;
    if (from !== me) {
      var handler = _onIncomingMessage(event);
      if (handler && typeof handler === 'function') {
        handler(event);
      }
      _triggerEvent('messageReceived', event);
    }
  };

  var _deliverUnsentMessages = function () {
    _sentMessageHistory.forEach(function (message) {
      _sendMessage(message.recipient, message.message);
    });
    _sentMessageHistory = [];
  };

  var _initTextChat = function () {
    _log(_logEventData.actionStart, _logEventData.variationAttempt);
    _enabled = true;
    _displayed = true;
    _initialized = true;
    _setupUI();
    _triggerEvent('showTextChat');
    _session.on('signal:text-chat', _handleTextChat);
    _log(_logEventData.actionStart, _logEventData.variationSuccess);
  };

  var _showTextChat = function () {
    _log(_logEventData.actionOpen, _logEventData.variationAttempt);
    document.querySelector(_this.options.textChatContainer).classList.remove('ots-hidden');
    _displayed = true;
    _triggerEvent('showTextChat');

    // Add OPEN success log event
    _log(_logEventData.actionOpen, _logEventData.variationSuccess);
  };

  var _hideTextChat = function () {
    _log(_logEventData.actionClose, _logEventData.variationAttempt);
    _log(_logEventData.actionEnd, _logEventData.variationAttempt);
    document.querySelector(_this.options.textChatContainer).classList.add('ots-hidden');
    _displayed = false;
    _triggerEvent('hideTextChat');

    // Add CLOSE success log event
    _log(_logEventData.actionClose, _logEventData.variationSuccess);
    _log(_logEventData.actionEnd, _logEventData.variationSuccess);
  };

  var _appendControl = function () {

    var feedControls = document.querySelector(_this.options.controlsContainer);

    var el = document.createElement('div');
    el.innerHTML = '<div class="ots-video-control circle text-chat enabled" id="enableTextChat"></div>';

    var enableTextChat = el.firstChild;
    feedControls.appendChild(enableTextChat);

    _controlAdded = true;

    enableTextChat.onclick = function () {

      if (!_initialized) {
        _initTextChat();
      } else if (!_displayed) {
        _showTextChat();
      } else {
        _hideTextChat();
      }
    };
  };

  var _validateOptions = function (options) {

    if (!options.session) {
      throw new Error('Text Chat Accelerator Pack requires an OpenTok session.');
    }

    // Generates a random alpha-numeric string of n length
    var uniqueString = function (length) {
      var len = length || 3;
      return Math.random().toString(36).substr(2, len);
    };

    // Returns session id prepended and appended with unique strings
    var generateUserId = function () {
      return [uniqueString(), _session.id, uniqueString()].join('');
    };

    _session = _.property('session')(options);
    _accPack = _.property('accPack')(options);

    /**
     * Create arbitary values for sender id and alias if not recieved
     * in options hash.
     */
    _sender = _.defaults(options.sender || {}, {
      id: generateUserId(),
      alias: ['User', uniqueString()].join(' ')
    });

    return _.defaults(_.omit(options, ['accPack', '_sender']), {
      limitCharacterMessage: 160,
      controlsContainer: '#feedControls',
      textChatContainer: '#chatContainer',
      alwaysOpen: false,
      appendControl: true,
    });
  };

  var _registerEvents = function () {
    var events = [
      'showTextChat',
      'hideTextChat',
      'messageSent',
      'errorSendingMessage',
      'messageReceived'
    ];
    _accPack && _accPack.registerEvents(events);
  };

  var _handleConnectionCreated = function (event) {
    if (event && event.connection.connectionId !== _session.connection.connectionId) {
      _remoteParticipant = true;
      _hideWaitingMessage();
    }
  };

  var _handleStreamCreated = function (event) {
    if (event && event.stream.connection.connectionId !== _session.connection.connectionId) {
      _remoteParticipant = true;
      _hideWaitingMessage();
    }
  };

  var _handleStreamDestroyed = function () {
    if (_session.streams.length() < 2) {
      _remoteParticipant = false;
    }
  };

  var _addEventListeners = function () {

    if (_accPack) {
      _accPack.registerEventListener('streamCreated', _handleStreamCreated);
      _accPack.registerEventListener('streamDestroyed', _handleStreamDestroyed);

      _accPack.registerEventListener('startCall', function () {
        if (!_this.options.alwaysOpen) {
          if (_controlAdded) {
            document.querySelector('#enableTextChat').classList.remove('ots-hidden');
          } else {
            _this.options.appendControl && _appendControl()
          }
        }
      });

      _accPack.registerEventListener('endCall', function () {
        if (!_this.options.alwaysOpen) {
          document.getElementById('enableTextChat').classList.add('ots-hidden');
          if (_displayed) {
            _hideTextChat();
          }
        }
      });
    } else {
      _session.on('streamCreated', _handleStreamCreated);
      _session.on('streamDestroyed', _handleStreamDestroyed);
    }

    _session.on('connectionCreated', _handleConnectionCreated);

    /**
     * We need to check for remote participants in case we were the last party to join and
     * the session event fired before the text chat component was initialized.
     */
    _handleStreamCreated();

  };

  // Constructor
  var TextChatAccPack = function (options) {

    // Save a reference to this
    _this = this;

    // Extend instance and set private vars
    _this.options = _validateOptions(options);

    // Init the analytics logs
    _logAnalytics();

    if (!!_.property('_this.options.limitCharacterMessage')(options)) {
      _log(_logEventData.actionSetMaxLength, _logEventData.variationSuccess);
    }

    if (_this.options.alwaysOpen) {
      _initTextChat();
    } else {
      _this.options.appendControl && _appendControl()
    }
    _registerEvents();
    _addEventListeners();
  };

  TextChatAccPack.prototype = {
    constructor: TextChatAccPack,
    isEnabled: function () {
      return _enabled;
    },
    isDisplayed: function () {
      return _displayed;
    },
    showTextChat: function () {
      _showTextChat();
    },
    hideTextChat: function () {
      _hideTextChat();
    },
    deliverUnsentMessages:function(){
      _deliverUnsentMessages();
    }
  };

  if (typeof exports === 'object') {
    module.exports = TextChatAccPack;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return TextChatAccPack;
    });
  } else {
    this.TextChatAccPack = TextChatAccPack;
  }

}.call(this));
