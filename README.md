![logo](./tokbox-logo.png)

# OpenTok One-to-One Communication Sample App<br/>Version 1.3

The OpenTok One-to-One Communication Sample App is an open-source solution that enables you to quickly get started in your development efforts to set up interoperable, production-quality audio/video communication between users.

With this sample app, you can:

- Start and end audio/visual communication between two users.
- Achieve interoperability between web and mobile devices.
- Mute or unmute audio.
- Enable or disable video.
- Control the camera to point in the forward direction or in the reverse direction (selfie mode).
- Customize the UI features and layout.

You can create mobile apps for Android and iOS, or embed the interactive session between users into any website. To get started with your development, visit the following sites:

- [OpenTok One-to-One Communication Sample App for Android](./android)
- [OpenTok One-to-One Communication Sample App for iOS](./iOS)
- [OpenTok One-to-One Communication Sample App for JavaScript](./js)

# Device interoperability with One-to-One communication

The OpenTok One-to-One Communication Sample App highlights the interoperability of web and mobile devices using the OpenTok platform. Regardless of the supported devices used, the OpenTok platform supports the ability of users to interact with each other and exchange audio and video. Even if the clients are on different platforms, they can both connect, publish, and subscribe to streams in the same session.

This sample app requires a **Session ID**, **Token**, and **API Key**. In the sample, you can get these values at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/). For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/).

For example, suppose one user is using a web (JS) version of the One-to-One Communication Sample App and another user is using a mobile version (Android or iOS). If they are both using the same **Session ID** and **API Key**, they can subscribe to each other’s audio and video streams, and the user interface rendered on both devices will allow them to interact with each other and take advantage of all the features of the sample app.

Use the following approach to try this out:

1. Configure a web and mobile user with the required  **Session ID**, **Token**, and **API Key** values, using the same **Session ID** and **API Key** for each.

2. Start the web and mobile apps. You will observe the following interactions:

   - Both apps connect to the session.
   - Both apps start publishing and subscribing to each other’s streams.

3. Observe what happens for each user when you:

   - Enable or disable local audio/video on the mobile app.
   - Enable or disable local audio/video on the web app.
   - Enable or disable remote audio/video on the mobile app.
   - Enable or disable remote audio/video on the web app.

As you get started with this OpenTok sample, you will learn the best practices used to develop and manage the audio, video, and camera elements on mobile devices or in the browser. We recommend this is as your first step in delivering [Real Time Communications (WebRTC)](https://tokbox.com/about-webrtc) solutions on the OpenTok platform.
