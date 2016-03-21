![logo](tokbox-logo.png)

# OpenTok One-to-One Communication Sample App<br/>Version 1.0

The OpenTok One-to-One Communication Sample App is an open-source solution that enables you to quickly get started in your development efforts to set up interoperable, production-quality audio/video communication between users. 

As you get started with this OpenTok sample, you will learn the best practices used to develop and manage the phone, video, and camera elements on mobile devices or in the browser as you . We recommend this is as your first step in delivering [Real Time Communications (WebRTC)](https://tokbox.com/about-webrtc) solutions on the OpenTok platform.

With this sample app, you can:

- Initiate interoperable audio/visual communication between two users, regardless of the devices they are using.
- Start and end a phone call.
- Mute or unmute audio.
- Enable or disable video.
- Control the camera to point in the forward direction or in the reverse direction (selfie mode).
- Customize the UI features and layout.

You can create mobile apps for Android and iOS, or embed the interactive session between users into any website. 

To get started with your development, visit the following sites:

- [OpenTok One-to-One Communication Sample App for Android](./android)
- [OpenTok One-to-One Communication Sample App for iOS](./iOS)
- [OpenTok One-to-One Communication Sample App for JavaScript](./js)

_**NOTE:** The One-to-One Communication Sample App requires a **Session ID**, **Token**, and **API Key**. In the samples, you can get these values at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/). For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/)._


# Device interoperability with One-to-One communication

The OpenTok One-to-One Communication Sample App highlights the interoperability of web and mobile devices using the OpenTok platform. Regardless of the supported devices used, the OpenTok platform supports the ability of users to interact with each other and exchange audio and video. Even if the clients are on different platforms, they can both connect, publish, and subscribe to streams in the same session.

For each user’s app you will need to add configuration detail that includes the **Session ID**, **Token**, and **API Key**:

- The **Session ID** uniquely identifies the session on the backend server. Both clients must use the same **Session ID** in order to communicate. The OpenTok platform supports interoperability, meaning that clients on different platforms can interact using this app. For example, a web client and mobile client can both connect, publish, and subscribe to streams in the same session.
- The **Token** authenticates the user to connect to the OpenTok session. Each client’s token must have a publisher role and must be generated from the same session.
- The **API Key** uniquely identifies your app so it can be authorized to use the OpenTok library and make requests to the backend. Both clients must use the same **API Key**.


For example, suppose one user is using a web (JS) version of the One-to-One Communication Sample App and another user is using a mobile version (Android or iOS). If they are both using the same **Session ID** and **API Key**, they can subscribe to each other’s audio and video streams, and the user interface rendered on both devices will allow them to interact with each other and take advantage of all the features of the sample app.

Use the following approach to try this out:

1. Configure a web and mobile user with the required  **Session ID**, **Token**, and **API Key** values, using the same **Session ID** and **API Key** for each.

2. For the mobile users, ensure that `SUBSCRIBE_TO_SELF = false` (Android) and `subscribeToSelf = NO` (iOS) in the configuration.

3. Start the web and mobile apps. You will observe the following interactions:

   - Both apps connect to the session.
   - Both apps start publishing and subscribing to each other’s streams.

4. Observe what happens for each user when you:

   - Enable or disable local audio/video on the mobile app.
   - Enable or disable local audio/video on the web app.
   - Enable or disable remote audio/video on the mobile app.
   - Enable or disable remote audio/video on the web app.


# License

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.




