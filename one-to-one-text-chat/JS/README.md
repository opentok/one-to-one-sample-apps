![logo](../../tokbox-logo.png)

# OpenTok Text Chat Sample App for JavaScript<br/>Version 1.0

This document describes how to use the OpenTok Text Chat Accelerator Pack for JavaScript. Through the exploration of the OpenTok Text Chat Sample App, you will learn best practices for exchanging text messages in a web-based application. 

You can configure and run this sample app within just a few minutes!


This guide has the following sections:

* [Prerequisites](#prerequisites): A checklist of everything you need to get started.
* [Quick start](#quick-start): A step-by-step tutorial to help you quickly run the sample app.
* [Exploring the code](#exploring-the-code): This describes the sample app code design, which uses recommended best practices to implement the text chat features. 

## Prerequisites

To be prepared to develop your text chat app:

1. Review the [OpenTok.js](https://tokbox.com/developer/sdks/js/) requirements.
2. Download the **opentok-text-chat.js** file provided by TokBox.
3. Download the TokBox Common Accelerator Session Pack provided by TokBox.
4. Your app will need a **Session ID**, **Token**, and **API Key**, which you can get at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/).

_**NOTE**: The OpenTok Developer Dashboard allows you to quickly run this sample program. For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/)._

## Quick start

To get up and running quickly with your app, go through the following steps in the tutorial provided below:

1. [Configuring the App](#configuring-the-app)
2. [Deploying and running](#deploying-and-running)

To learn more about the best practices used to design this app, see [Exploring the code](#exploring-the-code).


### Configuring the app

Now you are ready to add the configuration detail to your app. These will include the **Session ID**, **Token**, and **API Key** you retrieved earlier (see [Prerequisites](#prerequisites)).

In **app.js**, replace the following empty strings with the required detail:


   ```javascript
    apiKey: '',    // Replace with your OpenTok API Key
    sessionId: '', // Replace with a generated Session ID
    token: '',     // Replace with a generated token (from the dashboard or using an OpenTok server SDK)
   ```

_At this point you can try running the app! See [Deploying and running](#deploying-and-running) for more information._


### Deploying and running

The web page that loads the sample app for JavaScript must be served over HTTP/HTTPS. Browser security limitations prevent you from publishing video using a `file://` path, as discussed in the OpenTok.js [Release Notes](https://www.tokbox.com/developer/sdks/js/release-notes.html#knownIssues). To support clients running [Chrome 47 or later](https://groups.google.com/forum/#!topic/discuss-webrtc/sq5CVmY69sc), HTTPS is required. A web server such as [MAMP](https://www.mamp.info/) or [XAMPP](https://www.apachefriends.org/index.html) will work, or you can use a cloud service such as [Heroku](https://www.heroku.com/) to host the application.


## Exploring the code

This section describes how the sample app code design uses recommended best practices to deploy the text chat communication features. The sample app design extends the [OpenTok One-to-One Communication Sample App](../../one-to-one-sample-app) by adding logic using the `TextChatAccPack` class defined in `opentok-text-chat.js`.

For detail about the APIs used to develop this sample, see the [OpenTok.js Reference](https://tokbox.com/developer/sdks/js/reference/).

  - [Web page design](#web-page-design)
  - [Text Chat Accelerator Pack](#text-chat-accelerator-pack)

_**NOTE:** The sample app contains logic used for logging. This is used to submit anonymous usage data for internal TokBox purposes only. We request that you do not modify or remove any logging code in your use of this sample application._

### Web page design

While TokBox hosts [OpenTok.js](https://tokbox.com/developer/sdks/js/), you must host the sample app yourself. This allows you to customize the app as desired. The sample app has the following design, focusing primarily on the text chat features. For details about the one-to-one communication audio-video aspects of the design, see the [OpenTok One-to-One Communication Sample App](../../one-to-one-sample-app).

* **[accelerator-pack.js](./sample-app/public/js/components/accelerator-pack.js)**: The TokBox Common Accelerator Session Pack is a common layer that permits all accelerators to share the same OpenTok session, API Key and other related information, and is required whenever you use any of the OpenTok accelerators. This layer handles communication between the client and the components.

* **text-chat-acc-pack.js**:  _(Available only in the Text Chat Accelerator Pack)._ Manages the client text chat UI views and events, builds and validates individual text chat messages, and makes the chat UI available for placement.

* **[app.js](./sample-app/public/js/app.js)**: Stores the information required to configure the session and authorize the app to make requests to the backend server, manages the client connection to the OpenTok session, manages the UI responses to call events, and sets up and manages the local and remote media UI elements. 

* **[CSS files](./sample-app/public/css)**: Defines the client UI style. 

* **[index.html](./sample-app/public/index.html)**: This web page provides you with a quick start if you don't already have a web page making calls against OpenTok.js (via accelerator-pack.js) and opentok-text-chat.js. Its `<head>` element loads the OpenTok.js library, Text Chat library, and other dependencies, and its `<body>` element implements the UI container for the controls on your own page.


### Text Chat Accelerator Pack

The `TextChatAccPack` class in text-chat-acc-pack.js is the backbone of the text chat communication features for the app. 

This class sets up the text chat UI views and events, and provides functions for sending, receiving, and rendering individual chat messages.

#### Initialization

The following `options` fields are used in the `TextChatAccPack` constructor:

| Feature        | Field  |
| ------------- | ------------- |
| Set the chat container.   | `container`  |
| Sets the position of the element that displays the information for the character count within the UI.   | `charCountElement`  |
| Set the maximum chat text length.   | `maxTextLength`  |
| Set the sender alias and the sender ID of the outgoing messages.  | `senderAlias`, `senderId`  |


In this initialization code, the `TextChatAccPack` object is initialized, and the OpenTok [Session.on()](https://tokbox.com/developer/sdks/js/reference/Session.html#on) event handler is used to set up the signaling used in the exchange of individual text chat messages.

```javascript
_textChat = new TextChatAccPack(
            {
              charCountElement: options.textChat.charCountElement,
              acceleratorPack: self,
              sender: options.textChat.user,
              limitCharacterMessage: options.textChat.limitCharacterMessage
            });
```


#### Sending and receiving messages

The `TextChatAccPack` prototype defines a `_sendMessage()` function that extracts the string entered into the composer view’s message box and sends it to the recipient. In this example, it uses the [OpenTok signaling API](https://tokbox.com/developer/sdks/js/reference/Session.html#signal) to send an individual chat message to the other client connected to the OpenTok session. Note that the `sentOn` property in the message data is formatted as a timestamp or epoch.

```javascript
  var _sendMessage = function (recipient, message) {

     . . .

     var message_data = {
       message: arguments[1],
       user: this.options.user,
       sentOn: new Date()
     };

     . . .

     self._session.signal({
         type: 'chat',
         data: message_data,
         to: recipient
       },

     . . .
```


The `TextChatAccPack` prototype defines an `onIncomingMessage()` event handler that handles the OpenTok signals for incoming messages. In this example, it uses the `TextChatAccPack.getBubbleHtml()` method to render the received message:


```javascript
    var _onIncomingMessage = function (signal) {

       . . .

       this._renderChatMessage(signal.data.user, signal.data.message, signal.data.sentOn);

       . . .
    },


    var _renderChatMessage = function (user, message, sentOn) {

      . . .

      var view = this._textChat.getBubbleHtml({
        username: user.name,
        message: message,
        message_class: sent_by_class,
        time: sentOn
      });

      var chatholder = $(this._textChat._newMessages);
      chatholder.append(view);
      this._textChat._cleanComposer();
      chatholder[0].scrollTop = chatholder[0].scrollHeight;

      . . .
    }
```


