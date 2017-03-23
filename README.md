![logo](tokbox-logo.png)

# One to One Text Chat Sample App

The OpenTok One-to-One Text Chat Sample App is an open-source solution that enables you to quickly get started in your development efforts to set up interoperable, production-quality audio/video communication and to exchange text messages between mobile or browser-based devices.

With the sample app, you can:

- Initiate and manage interoperable text chat communication between two users, regardless of the devices they are using.
- Customize the UI features and layout.

You can create mobile apps for Android and iOS, or embed the interactive session between users into any website.

To get started with your development, visit the following sites:

- [OpenTok Text Chat Accelerator Pack for Android](./android)
- [OpenTok Text Chat Accelerator Pack for iOS](./ios)
- [OpenTok Text Chat Accelerator Pack for JavaScript](./js)

_**NOTE:** The Text Chat Sample App requires a **Session ID**, **Token**, and **API Key**. In the samples, you can get these values at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/). For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/)._

## JSON Requirements for Text Chat Signaling

The JSON used when using the OpenTok signaling API with the OpenTok Text Chat component describes the information used when submitting a chat message. This information includes the date, chat message text, sender alias, and sender ID. The JSON is formatted as shown in this example:

```json
{
  "sentOn" : 1462396461923.305,
  "text" : "Hi",
  "sender" : {
    "alias" : "Tokboxer",
    "id" : "16FEB40D-C09B-4491-A983-44677B7EBB3E"
  }
}
```

This formatted JSON is converted to a string, which is submitted to the OpenTok signaling API. For more information, see:

  - [Signaling - JavaScript](https://tokbox.com/developer/guides/signaling/js/)
  - [Signaling - iOS](https://tokbox.com/developer/guides/signaling/ios/)
  - [Signaling - Android](https://tokbox.com/developer/guides/signaling/android/)
