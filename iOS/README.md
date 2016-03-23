![logo](../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for iOS<br/>Version 1.0

This document describes how to use the OpenTok One-to-One Communication Sample App for iOS. You will learn best practices for managing the phone, video, and camera elements on an iOS mobile device. We recommend this is as your first step in delivering interoperable, production-quality audio/video solutions on the OpenTok platform. 

You can configure and run this sample app within just a few minutes!


This guide has the following sections:

* [Prerequisites](#prerequisites): A checklist of everything you need to get started.
* [Quick start](#quick-start): A step-by-step tutorial to help you quickly import and run the sample app.
* [Exploring the code](#exploring-the-code): This describes the sample app code design, which uses recommended best practices to implement the one-to-one communication features. 

## Prerequisites

To be prepared to develop your one-to-one communication app:

1. Xcode version 5 or later.
2. Download the [OpenTok iOS SDK](https://tokbox.com/downloads/opentok-ios-sdk-2.7.1).
3. Review the [OpenTok iOS SDK Requirements](https://tokbox.com/developer/sdks/ios/).
4. Your app will need a **Session ID**, **Token**, and **API Key**, which you can get at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/).

_**NOTE**: The OpenTok Developer Dashboard allows you to quickly run this sample program. For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/)._

## Quick start

To get up and running quickly with your app, go through the following steps in the tutorial provided below:

1. [Importing the Xcode Project](#importing-the-xcode-project)
2. [Adding the OpenTok SDK](#adding-the-opentok-sdk)
3. [Configuring the App](#configuring-the-app)

To learn more about the best practices used to design this app, see [Exploring the code](#exploring-the-code).

### Importing the Xcode project

1. Clone the OpenTok One-to-One Communication Sample App repository.
2. Start Xcode. 
3. Click **File > Open**.
4. Navigate to the **iOS** folder, select **OneToOneSample.xcodeproj**, and click **Open**.


### Adding the OpenTok SDK

There are two ways to add the frameworks you need. You can add them quickly using CocoaPods, or add them individually.

#### Using CocoaPods

1. In a terminal prompt, navigate into your project directory and type `pod install`.
3. Reopen your project using the new *.xcworkspace file.

For more information about CocoaPods, including installation instructions, visit [CocoaPods Getting Started](https://guides.cocoapods.org/using/getting-started.html#getting-started).

#### Adding the frameworks individually

1.  Drag the **OpenTok.framework** into your project. Select the framework and ensure **Target Membership** is checked in the **File Inspector**.
2.  From the **Project Navigator** view, click **General**. Add the framework in **Embedded Binaries** and ensure it is in **Linked Frameworks and Libraries**.
3.  On the **General** tab under **Linked Frameworks and Libraries**, add all the required frameworks listed at [OpenTok iOS SDK Requirements](https://tokbox.com/developer/sdks/ios/).


### Configuring the app

Now you are ready to add the configuration detail to your app. These will include the **Session ID**, **Token**, and **API Key** you retrieved earlier (see [Prerequisites](#prerequisites)).

In **ViewController.m**, replace the following empty strings with the required detail:


   ```objc
// Replace with your OpenTok API key
static NSString* const kApiKey = @"";
// Replace with your generated session ID
static NSString* const kSessionId = @"";
// Replace with your generated token
static NSString* const kToken = @"";
   ```


You may also set the `subscribeToSelf` constant. Its default value, `NO`, means that the app subscribes automatically to the other client’s stream. This is required to establish communication between two streams using the same Session ID:

   ```objc
// Set to NO to subscribe to streams other than your own.
static bool subscribeToSelf = NO;
   ```

_At this point you can try running the app! You can either use a simulator or an actual mobile device._


## Exploring the code

This section describes how the sample app code design uses recommended best practices to implement the one-to-one communication features. 

For detail about the APIs used to develop this sample, see the [OpenTok Android SDK API Reference](https://tokbox.com/developer/sdks/android/reference/) and [Android API Reference](http://developer.android.com/reference/packages.html).

  - [Class design](#class-design)
  - [Session and stream management](#session-and-stream-management)
  - [User interface](#user-interface)

_**NOTE:** The sample app contains logic used for logging. This is used to submit anonymous usage data for internal TokBox purposes only. We request that you do not modify or remove any logging code in your use of this sample application._

### Class design

The following classes represent the software design for this sample app.

| Class        | Description  |
| ------------- | ------------- |
| `ViewController`   | Stores the information required to configure the session and authorize the app to make requests to the backend server.<br/>In conjunction with **Main.storyboard**, this class implements the UI and its responses to all events associated with actions for the local and remote audio and video controls, the publisher’s start/end call button, and the publisher’s camera position (forward or selfie mode).   |
| `OneToOneCommunication`   | Uses the OpenTok API to initiate the client connection to the OpenTok session, and manages the audio and video stream subscriptions. <br/> |


### Session and stream management

The `OneToOneCommunication` class is the backbone of the one-to-one communication features for the app. 

This class conforms to the protocols that initiate the client connection to the OpenTok session and sets up the listeners for the publisher and subscriber streams:

```objc
@interface OneToOneCommunication () <OTSessionDelegate, OTSubscriberKitDelegate, OTPublisherDelegate>
```

#### Protocol conformance and implementation

The protocols to which the `OneToOneCommunication` class conforms are described in the following table. See their descriptions in the [OpenTok iOS SDK Reference](https://tokbox.com/developer/sdks/ios/reference/) for information about the methods required to implement them. 


| Protocol        | Description  |
| ------------- | ------------- |
| [`OTSessionDelegate`](https://tokbox.com/developer/sdks/android/reference/com/opentok/android/Session.SessionListener.html)   | Monitors session state, handling client connections and stream events. |
| [`OTSubscriberKitDelegate`](https://tokbox.com/developer/sdks/ios/reference/Protocols/OTSubscriberKitDelegate.html)      | Monitors subscriber events.  |
| [`OTPublisherDelegate`](https://tokbox.com/developer/sdks/ios/reference/Protocols/OTPublisherDelegate.html) | Monitors publisher stream events and changes to the camera position.  |


#### Methods

The following `OneToOneCommunication` methods are used for session and stream management, and in most cases are required by the protocols to which the class conforms.

| Feature        | Methods  |
| ------------- | ------------- |
| Manage the publisher and subscriber instances.   | `doPublish`, `doUnpublish`, `doSubscribe`, `cleanupSubscriber`|
| Start and end the session connections.   | `doConnect`, `doDisconnect`, `sessionDidConnect`, `sessionDidDisconnect`|
| Manage the subscription streams.      | `streamCreated`, `streamDestroyed` |
| Respond to subscriber connection events. | `subscriberDidConnectToStream`  |



### User interface

As described in [Class design](#class-design), the `ViewController` class, in conjunction with **Main.storyboard**, manages the UI responses to media usage events, which are associated with actions for the local and remote audio and video controls, the publisher’s start/end call button, and the publisher’s camera position (forward or selfie mode).

| Feature       | Methods       |
| ------------- | ------------- |
| Subscriber audio.   | `subscriberAudioButtonPressed` |
| Subscriber video.   | `subscriberVideoButtonPressed`  |
| Publisher audio.      | `publisherMicrophoneButtonPressed`  |
| Publisher start and end call. | `publisherCallButtonPressed `  |
| Publisher video. | `publisherVideoButtonPressed`  |
| Publisher camera orientation (forward or selfie mode). | `publisherCameraButtonPressed`  |


These properties of the `ViewController ` class manage the views as the publisher and subscriber participate in the session.

| Property        | Description  |
| ------------- | ------------- |
| `publisherView` | UI view for the publisher  |
| `subscriberView` | UI view for the subscriber  |










