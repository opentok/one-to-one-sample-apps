
define([
  'src/Chat'
], function (Chat) {
  'use strict';

  describe('The Chat client', function () {

    var message = 'Test contents';
    var sender = { connectionId: 'other' };
    var chat;

    var session = {
      connection: { connectionId: 'me' },
      on: function (type, callback) {
        this['on' + type] = callback;
      },
      signal: sinon.spy(),
      fakeEvent: function (type, evt) {
        var callback = this['on' + type] || function () {};
        callback(evt);
      }
    };

    beforeEach(function () {
      session.signal.reset();
      chat = new Chat({ session: session });
    });

    it('allows to send content via signals', function () {
      chat.send(message);

      var signalSent = session.signal.args[0][0];
      var expectedSignal = { type: 'TextChat', data: message };

      expect(signalSent).to.deep.equal(expectedSignal);
    });

    it('allows to customise the signal to send', function () {
      chat = new Chat({ session: session, signalName: 'test' });
      chat.send(message);

      var signalSent = session.signal.args[0][0];
      var expectedSignal = { type: 'test', data: message };

      expect(signalSent).to.deep.equal(expectedSignal);
    });

    it('informs when receiving a message via callback', function () {
      chat.onMessageReceived = sinon.spy();
      session.fakeEvent('signal:TextChat', { data: message, from: sender });
      expect(chat.onMessageReceived.calledWith(message, sender)).to.be.ok;
    });

    it('allows to customise the signal to listen for', function () {
      chat = new Chat({ session: session, signalName: 'test' });
      chat.onMessageReceived = sinon.spy();
      session.fakeEvent('signal:test', { data: message, from: sender });
      expect(chat.onMessageReceived.calledWith(message, sender)).to.be.ok;
    });

    it('discards own sent messages', function () {
      var me = session.connection;
      chat.onMessageReceived = sinon.spy();
      session.fakeEvent('signal:TextChat', { data: message, from: me });
      expect(chat.onMessageReceived.called).to.equal(false);
    });

  });

});
