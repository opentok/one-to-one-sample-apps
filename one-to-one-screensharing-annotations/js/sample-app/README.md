![logo](../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for JavaScript<br/>Version 1.0

This document describes how to use the OpenTok One-to-One Communication Sample App for JavaScript. You will learn best practices for managing the phone, video, and camera elements in a web-based application. We recommend this is as your first step in delivering interoperable, production-quality audio/video solutions on the OpenTok platform. 

You can configure and run this sample app within just a few minutes!


This guide has the following sections:

* [Prerequisites](#prerequisites): A checklist of everything you need to get started.
* [Quick start](#quick-start): A step-by-step tutorial to help you quickly import and run the sample app.
* [Exploring the code](#exploring-the-code): This describes the sample app code design, which uses recommended best practices to implement the one-to-one communication features. 

## Prerequisites

To be prepared to develop your one-to-one communication app:

1. Review the [OpenTok.js](https://tokbox.com/developer/sdks/js/) requirements.
2. Your app will need a **Session ID**, **Token**, and **API Key**, which you can get at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/).

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

This section describes how the sample app code design uses recommended best practices to implement the one-to-one communication features. 

For detail about the APIs used to develop this sample, see the [OpenTok.js Reference](https://tokbox.com/developer/sdks/js/reference/).

  - [Web page design](#web-page-design)
  - [Session and stream management](#session-and-stream-management)
  - [User interface](#user-interface)

_**NOTE:** The sample app contains logic used for logging. This is used to submit anonymous usage data for internal TokBox purposes only. We request that you do not modify or remove any logging code in your use of this sample application._

### Web page design

While TokBox hosts [OpenTok.js](https://tokbox.com/developer/sdks/js/), you must host the sample app yourself. This allows you to customize the app as desired. The sample app has the following design:

* **[one-to-one-communication.js](./public/js/components/one-to-one-communication.js)**:  Sets up the listeners and handlers for the publisher and subscriber streams, and defines the callbacks for enabling and disabling local and remote media.

* **[app.js](./public/js/app.js)**: Stores the information required to configure the session and authorize the app to make requests to the backend server, manages the client connection to the OpenTok session, manages the UI responses to call events, and sets up and manages the local and remote audio and video UI elements. 

* **[Image files](./public/images)**: Used for the communication and media icons. 

* **[index.html](./public/index.html)**: This web page provides you with a quick start if you don't already have a web page making calls against OpenTok.js. Its `<head>` element loads the OpenTok.js library and other dependencies, and its `<body>` element implements the UI container for the local and remote controls on your own page.


### Session and stream management

**app.js**: This script uses the OpenTok.js API to initiate the client connection to the OpenTok session. The `init` function uses the OpenTok.js API. It initializes the session by calling [OT.initSession](https://tokbox.com/developer/sdks/js/reference/OT.html#initSession), and creates the session connection by calling [Session.connect](https://tokbox.com/developer/sdks/js/reference/Session.html#connect). The function then instantiates the `Call` object, passing the session object to it:

```javascript
var init = function() {

  // Get session
  _options.session = OT.initSession(_options.apiKey, _options.sessionId);

  // Connect
  _options.session.connect(_options.token, function(error) {
    if (error) {
      console.log('Session failed to connect');
    } else {
      _call = new Call(_options)
      _addEventListeners();
    }
  });

};
```


**one-to-one-communication.js**: The `Call` object is the backbone of the one-to-one communication features for the app, and can be customized for reuse in your applications. It sets up the event handling for the publisher and subscriber streams.

   - The constructor adds the participant event handlers by invoking the [Session.on](https://tokbox.com/developer/sdks/js/reference/Session.html#on) method.
   - The `_publish` function starts publishing an audio-video stream to the session by invoking the [Session.publish](https://tokbox.com/developer/sdks/js/reference/Session.html#publish) method.
   - The `start` prototype method sets up the stream handlers that manage the call status.



The following `Call` prototype methods are used for session and stream management:

| Feature        | Methods  |
| ------------- | ------------- |
| Start and end the session connections.   | `start`, `end` |
| Respond to subscriber connection events. | `onParticipantJoined`, `onParticipantLeft`  |



### User interface

As described in [Web page design](#web-page-design), **app.js** manages the UI responses to call events captured by the `Call` object prototype methods, and sets up and manages the local and remote audio and video UI elements. It provides a bridge between the OpenTok communication logic and the UI, allowing you to customize the UI for events that are fired.

The `_callElements` object accesses the DOM to retrieve the local and remote controls, and the `_toggleMediaProperties` function toggles the local and remote media depending on the value of its `type` parameter.






