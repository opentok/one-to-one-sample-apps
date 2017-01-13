![logo](../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for JavaScript<br/>Version 1.3

## Quick start

This section shows you how to prepare and run the sample application.

### Configuring the app

Configure the sample app code. Then, build and run the app.

1. Get values for **API Key**, **Session ID**, and **Token**. See [OpenTok One-to-One Communication Sample App home page](../README.md) for important information.

2. In **app.js**, replace the following empty strings with the corresponding **API Key**, **Session ID**, and **Token** values:


   ```javascript
    apiKey: '',    // Replace with your OpenTok API Key
    sessionId: '', // Replace with a generated Session ID
    token: '',     // Replace with a generated token (from the dashboard or using an OpenTok server SDK)
   ```

_At this point you can try running the app! See [Deploying and running](#deploying-and-running) for more information._


### Deploying and running

The web page that loads the sample app for JavaScript must be served over HTTP/HTTPS. Browser security limitations prevent you from publishing video using a `file://` path, as discussed in the OpenTok.js [Release Notes](https://www.tokbox.com/developer/sdks/js/release-notes.html#knownIssues). To support clients running [Chrome 47 or later](https://groups.google.com/forum/#!topic/discuss-webrtc/sq5CVmY69sc), HTTPS is required. A [Node](https://nodejs.org/en/) server will work, as will [MAMP](https://www.mamp.info/) or [XAMPP](https://www.apachefriends.org/index.html).  You can also use a cloud service such as [Heroku](https://www.heroku.com/) to host the application.



## Exploring the code

This section describes best practices the sample app code uses to implement the one-to-one communication features.

For detail about the APIs used to develop this sample, see the [OpenTok.js Reference](https://tokbox.com/developer/sdks/js/reference/).

_**NOTE:** This sample app collects anonymous usage data for internal TokBox purposes only. Please do not modify or remove any logging code from this sample application._

### Web page design

While TokBox hosts [OpenTok.js](https://tokbox.com/developer/sdks/js/), you must host the sample app yourself. This allows you to customize the app as desired. The sample app has the following design:

* **[opentok-one-to-one-communication.js](./public/js/components/opentok-one-to-one-communication.js)**:  Sets up the listeners and handlers for the publisher and subscriber streams, and defines the callbacks for enabling and disabling local and remote media.

* **[app.js](./public/js/app.js)**: Stores the information required to configure the session and authorize the app to make requests to the backend server, manages the client connection to the OpenTok session, manages the UI responses to call events, and sets up and manages the local and remote audio and video UI elements.

* **[Image files](./public/images)**: Used for the communication and media icons.

* **[index.html](./public/index.html)**: This web page provides you with a quick start if you don't already have a web page making calls against OpenTok.js. Its `<head>` element loads the OpenTok.js library and other dependencies, and its `<body>` element implements the UI container for the local and remote controls on your own page.


### Session and stream management

**app.js**: This script uses the OpenTok.js API to initiate the client connection to the OpenTok session. The `init` function initializes the session by calling [OT.initSession](https://tokbox.com/developer/sdks/js/reference/OT.html#initSession), and connects to the session by calling [Session.connect](https://tokbox.com/developer/sdks/js/reference/Session.html#connect). The function then creates an instance of the `Communication` accelerator pack,  passing the session object to it:

```javascript
var _init = function () {

    // Get session
    _session = OT.initSession(_options.apiKey, _options.sessionId);

    // Connect
    _session.connect(_options.token, function (error) {
      if (error) {
        console.log('Session failed to connect');
      } else {
        _communication = new CommunicationAccPack(_.extend(_options, {
          session: _session,
          localCallProperties: _options.localCallProperties
        }));
        _addEventListeners();
        _initialized = true;
        _startCall();
      }
    });

  };
```

**opentok-one-to-one-communication.js**: The `CommunicationAccPack` provides the backbone of the app, and can be customized for reuse in your applications. It sets up event handling and manages publisher and subscriber streams.

   - The module adds the participant event handlers by invoking the [Session.on](https://tokbox.com/developer/sdks/js/reference/Session.html#on) method.
   - The `_publish` function starts publishing an audio-video stream to the session by invoking the [Session.publish](https://tokbox.com/developer/sdks/js/reference/Session.html#publish) method.
   - The `start` prototype method sets up the stream handlers that manage the call status.



The following `CommunicationAccPack` methods are used for session and stream management:

| Feature        | Methods  |
| ------------- | ------------- |
| Start and end the session connections.   | `start`, `end` |
| Enable and disable local and remote media | `enableLocalAudio`, `enableLocalVideo`, `enableRemoteAudio`, `enableRemoteVideo`  |



### User interface

As described in [Web page design](#web-page-design), **app.js** manages the UI responses to call events captured by the `CommunicationAccPack` , sets up and manages the local and remote audio/video UI elements. It provides a bridge between the OpenTok communication logic and the UI, allowing for event-based customization.


## Requirements

To develop your one-to-one communication app:

1. Review the [OpenTok.js](https://tokbox.com/developer/sdks/js/) requirements. **OpenTok.js version 2.8.x** is required for this sample app.
1. Install the OpenTok One-to-One Communication Accelerator Pack with [npm](https://www.npmjs.com/package/opentok-one-to-one-communication) or get it from [GitHub](https://github.com/opentok/one-to-one-sample-apps/blob/master/js/public/js/components/opentok-one-to-one-communication.js).
