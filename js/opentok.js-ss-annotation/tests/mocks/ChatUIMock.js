define([], function () {
  'use strict';

  function ChatUIMock() {
    ChatUIMock.instance = this;
    this._constructor.apply(this, arguments);
  }
  ChatUIMock.prototype._constructor = sinon.spy();
  ChatUIMock.prototype.enableSending = function () {};
  ChatUIMock.prototype.disableSending = function () {};
  ChatUIMock.prototype.fakeClickOnSend = function (contents, callback) {
    this.onMessageReadyToSend(contents, callback);
  };
  ChatUIMock.prototype.addMessage = sinon.spy();

  return ChatUIMock;
});
