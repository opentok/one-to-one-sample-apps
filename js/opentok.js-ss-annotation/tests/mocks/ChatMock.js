define([], function () {
  'use strict';

  function ChatMock() {
    ChatMock.instance = this;
    this._constructor.apply(this, arguments);
  }
  ChatMock.prototype._constructor = sinon.spy();
  ChatMock.prototype.send = sinon.spy();
  ChatMock.prototype.fakeReceiveMessage = function (contents, from) {
    this.onMessageReceived(contents, from);
  };

  return ChatMock;
});
