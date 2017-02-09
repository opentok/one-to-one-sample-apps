![logo](../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for JavaScript<br/>Version 1.3

## Quick start

This section shows you how to prepare and run the sample application. The app is built by the [Accelerator Core JS](https://github.com/opentok/accelerator-core-js).

### Configuring the app

Configure the sample app code. Then, build and run the app.

1. Get values for **API Key**, **Session ID**, and **Token**. See [OpenTok One-to-One Communication Sample App home page](../README.md) for important information.

2. In **app.js**, replace the following empty strings with the corresponding **API Key**, **Session ID**, and **Token** values:

   ```javascript
    apiKey: '',    // Replace with your OpenTok API Key
    sessionId: '', // Replace with a generated Session ID
    token: '',     // Replace with a generated token (from the dashboard or using an OpenTok server SDK)
   ```

### Deploying and running the app

```javascript
$ npm install
$ npm run build
$ node server.js
```

The web page that loads the sample app for JavaScript must be served over HTTP/HTTPS. Browser security limitations prevent you from publishing video using a `file://` path, as discussed in the OpenTok.js [Release Notes](https://www.tokbox.com/developer/sdks/js/release-notes.html#knownIssues). To support clients running [Chrome 47 or later](https://groups.google.com/forum/#!topic/discuss-webrtc/sq5CVmY69sc), HTTPS is required. A [Node](https://nodejs.org/en/) server will work, as will [MAMP](https://www.mamp.info/) or [XAMPP](https://www.apachefriends.org/index.html).  You can also use a cloud service such as [Heroku](https://www.heroku.com/) to host the application.


## Exploring the code

For details about how to use the Accelerator Core in the sample app, see [here](https://github.com/opentok/accelerator-core-js#sample-applications).

