
define([
  'src/ChatMessage'
], function (ChatMessage) {
  'use strict';

  describe('The Chat User Interface', function () {

    var root, ChatUI, ui;

    var context = newContext({
      // XXX: Not mocking but newContext does not allow to set the baseURL
      'ChatMessage': ChatMessage
    });

    // TODO: It's not completely compatible with Chrome (shift is always true!)
    // and I don't get it to update the value of the element so testing adding
    // a breakline by clicking shift + enter is not possible yet.
    function pressKey(element, character) {
      var evt = document.createEvent( 'KeyboardEvent' );
      var keyCode = character.charCodeAt(0);

      Object.defineProperty(evt, 'which', { get: function () {
        return this.keyCodeVal;
      }});

      Object.defineProperty(evt, 'keyCode', { get: function () {
        return this.keyCodeVal;
      }});

      ['keydown', 'keypress', 'keyup'].forEach(function (type) {
        (evt.initKeyEvent || evt.initKeyboardEvent).call(evt,
          type,
          true,
          true,
          null,
          false,
          false,
          false,
          false,
          character.charCodeAt(0),
          0
        );

        evt.keyCodeVal = keyCode;

        element.dispatchEvent(evt);
      });
    }

    beforeEach(function (done) {
      root = document.createElement('BODY');
      document.querySelector = sinon.stub().returns(root);
      context(['base/src/ChatUI'], function (module) {
        ChatUI = module;
        ui = new ChatUI({ parent: 'body' });
        done();
      });
    });

    describe('UI', function () {

      it('includes a composer area', function () {
        expect(root.querySelector('.ot-composer')).not.to.be.null;
      });

      it('includes a bubbles area', function () {
        expect(root.querySelector('.ot-bubbles')).not.to.be.null;
      });

      it('includes a send button', function () {
        expect(root.querySelector('.ot-send-button')).not.to.be.null;
      });

      it('includes a character counter', function () {
        expect(root.querySelector('.ot-character-counter')).not.to.be.null;
      });

    });

    xdescribe('Composer', function () {

      var message = 'Hi folks!';
      var enter = '\r';
      var composer;

      beforeEach(function () {
        composer = root.querySelector('.ot-composer');
      });

      it('sends the message when typing enter', function (done) {
        composer.value = message;
        ui.onMessageReadyToSend = function (contents) {
          expect(contents).to.equal(message);
          done();
        };
        pressKey(composer, enter);
      });

      it('updates the character counter while writing', function () {
        throw new Error('Add a test!');
      });

    });

    xdescribe('Sending message', function () {

      it('clears the composer after sending a message successfully',
      function () {
        throw new Error('Add a test!');
      });

      it('shows an error message if something goes wrong', function () {
        throw new Error('Add a test!');
      });

      it('does not allow sending when reaching the limit of characters',
      function () {
        throw new Error('Add a test!');
      });

    });

    xdescribe('Receiving messages', function () {

      it('scrolls down the conversation area when already at the bottom of it',
      function () {
        throw new Error('Add a test!');
      });

      it('does not scroll down the conversation if we are scrolling up',
      function () {
        throw new Error('Add a test!');
      });

    });

    xdescribe('Grouping bubbles', function () {

      it('groups bubbles if messages differs less than 2 minutes', function () {
        throw new Error('Add a test!');
      });

      xit('does not group bubbles if messages differs more than 2 minutes',
      function () {
        throw new Error('Add a test!');
      });

    });

  });

});
