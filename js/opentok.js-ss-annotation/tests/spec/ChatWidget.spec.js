
define([
  'tests/mocks/ChatUIMock',
  'tests/mocks/ChatMock'
], function (ChatUIMock, ChatMock) {
  'use strict';

  var ChatWidget;
  var ChatMessageMock = function (id, alias, text) { this.text = text; };

  var context = newContext({
    'Chat': ChatMock,
    'ChatUI': ChatUIMock,
    'ChatMessage': ChatMessageMock
  });

  describe('The ChatWidget class', function () {

    var message = 'Hello world';

    var session = {
      once: function () {},
      connection: { connectionId: '123' }
    };
    var widget;

    beforeEach(function (done) {
      context(['base/src/ChatWidget.js'], function (module) {
        ChatWidget = module;
        widget = new ChatWidget({ session: session });
        done();
      });
      ChatUIMock.prototype._constructor.reset();
      ChatUIMock.prototype.addMessage.reset();
      ChatMock.prototype.send.reset();
      ChatMock.prototype._constructor.reset();
    });

    it('throws if no session supplied', function () {
      function newChatWidget() { new ChatWidget(); }
      expect(newChatWidget).to.throw;
    });

    it('creates a UI for the widget', function () {
      expect(ChatUIMock.prototype._constructor.called).to.be.true;
    });

    it('uses a chat client', function () {
      expect(ChatMock.prototype._constructor.called).to.be.true;
    });

    it('send a message when user has click on send', function () {
      ChatUIMock.instance.fakeClickOnSend(message);
      expect(ChatMock.instance.send.calledWith(message)).to.be.true;
    });

    it('adds a message to the UI when receiving a message', function () {
      ChatMock.instance.fakeReceiveMessage(message, {
        connectionId: '007',
        data: 'James Bond'
      });
      var messageAdded = ChatUIMock.instance.addMessage.args[0][0];
      expect(messageAdded).to.be.an.instanceOf(ChatMessageMock);
      expect(messageAdded.text).to.equal(message);
    });

    describe('message tranformation', function () {

      it('replaces breaklines with HTML breaklines', function () {
        var raw = 'Hello\nWorld';
        var expected = 'Hello<br/>World';
        expect(widget.renderMessage(raw)).to.equal(expected);
      });

      it('replaces URL references with HTML anchors', function () {
        var raw = 'Visit http://tokbox.com';
        var expected = 'Visit <a href="http://tokbox.com" ' +
                       'target="_blank">http://tokbox.com</a>';
        expect(widget.renderMessage(raw)).to.equal(expected);
      });

    });
  });

});
