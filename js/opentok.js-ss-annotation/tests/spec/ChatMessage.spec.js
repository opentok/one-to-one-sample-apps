
define([
  'src/ChatMessage'
], function (ChatMessage) {
  'use strict';

  describe('The Chat Message', function () {

    var bond = {
      id: '007',
      name: 'James Bond',
      line: 'The name\'s Bond. James Bond.'
    };

    it('contains pertinent information about message content and identity',
    function () {
      var message = new ChatMessage(bond.id, bond.name, bond.line);
      expect(message.senderId).to.equal(bond.id);
      expect(message.senderAlias).to.equal(bond.name);
      expect(message.text).to.equal(bond.line);
      expect(message.dateTime).to.be.a('Date');
    });

  });

});
