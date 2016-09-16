![logo](../../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for iOS<br/>Version 1.1

## Quick start

This section shows you how to prepare, build, and run the sample application.

### Install the project files

Use CocoaPods to install the project files and dependencies.

1. Install CocoaPods as described in [CocoaPods Getting Started](https://guides.cocoapods.org/using/getting-started.html#getting-started).
1. In Terminal, `cd` to your project directory and type `pod install`.
1. Reopen your project in Xcode using the new `*.xcworkspace` file.

### Configure and build the app

Configure the sample app code. Then, build and run the app.

1. Get values for **API Key**, **Session ID**, and **Token**. See [OpenTok One-to-One Communication Sample App home page](../README.md) for important information.

1. In Xcode, open **AppDelegate.h** and replace the following empty strings with the corresponding **API Key**, **Session ID**, and **Token** values:

    ```objc
    - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    // Override point for customization after application launch.    
    [OTOneToOneCommunicator setOpenTokApiKey:@""
                                   sessionId:@""
                                       token:@""];
    return YES;
    }
    ```

1. Use Xcode to build and run the app on an iOS simulator or device.

## Exploring the code

This section describes best practices the sample app code uses to implement the one-to-one communication features.

For detail about the APIs used to develop this sample, see the [OpenTok iOS SDK Reference](https://tokbox.com/developer/sdks/ios/reference/).

_**NOTE:** This sample app collects anonymous usage data for internal TokBox purposes only. Please do not modify or remove any logging code from this sample application._

### Class design

The following classes represent the software design for this sample app.

| Class        | Description  |
| ------------- | ------------- |
| `OTOneToOneCommunicator`   | Uses the OpenTok API to initiate the client connection to the OpenTok session, and manages the audio and video stream subscriptions.  |
| `MainViewController`   | <br/>In conjunction with **Main.storyboard**, this class implements the UI and its responses to all events associated with actions for the local and remote audio and video controls, the publisher’s start/end call button, and the publisher’s camera position (forward or selfie mode).   |
| `MainView`  | Defines the main user interfaces of the sample app, and contains the logic for styling and transitioning for the user interfaces. <br/> |


### Session and stream management

The `OTOneToOneCommunicator` class is the backbone of the one-to-one communication features for the app.

This class conforms to the protocols that initiate the client connection to the OpenTok session and sets up the listeners for the publisher and subscriber streams:

```objc
@interface OTOneToOneCommunicator : NSObject;
```

#### Protocol conformance and implementation

The OpenTok protocols to which the `OTOneToOneCommunicator` class conforms in its internally defined implementation are described in the following table. See their descriptions in the [OpenTok iOS SDK Reference](https://tokbox.com/developer/sdks/ios/reference/) for information about the methods required to implement them.


| Protocol        | Description  |
| ------------- | ------------- |
| [`OTSessionDelegate`](https://tokbox.com/developer/sdks/ios/reference/Protocols/OTSessionDelegate.html)   | Monitors session state, handling client connections and stream events. |
| [`OTSubscriberKitDelegate`](https://tokbox.com/developer/sdks/ios/reference/Protocols/OTSubscriberKitDelegate.html)      | Monitors subscriber events.  |
| [`OTPublisherDelegate`](https://tokbox.com/developer/sdks/ios/reference/Protocols/OTPublisherDelegate.html) | Monitors publisher stream events and changes to the camera position.  |


#### Methods

The following `OTOneToOneCommunicator` methods are used for session and stream management, and in most cases are required by the protocols to which the class conforms.

| Feature        | Methods  |
| ------------- | ------------- |
| Manage the publisher and subscriber instances, start and end session connections, signal events.   | `connectWithHandler`, `disconnect`|
| Manage the subscription streams.      | `streamCreated`, `streamDestroyed` |
| Respond to subscriber connection events. | `subscriberDidConnectToStream`  |
| Store configuration information across the app | `oneToOneCommunicator` |
| Set configuration information | `setOpenTokApiKey` |


The following enum notifies the main controller of all session, publisher, and subscriber events:

```objc
typedef NS_ENUM(NSUInteger, OTOneToOneCommunicationSignal) {
    OTSignalSessionDidConnect = 0,
    OTSignalSessionDidDisconnect,
    OTSignalSessionDidFail,
    OTSignalSessionStreamCreated,
    OTSignalSessionStreamDestroyed,
    OTSignalPublisherDidFail,
    OTSignalSubscriberConnect,
    OTSignalSubscriberDidFail,
    OTSignalSubscriberVideoDisabled,
    OTSignalSubscriberVideoEnabled,
    OTSignalSubscriberVideoDisableWarning,
    OTSignalSubscriberVideoDisableWarningLifted,
};
```

### View Controllers

As described in [Class design](#class-design), the `MainViewController` class, in conjunction with **Main.storyboard**, receives notifications from the `OTOneToOneCommunicator` class and manages the UI responses to media usage events, which are associated with actions for the local and remote audio and video controls, the publisher’s start/end call button, and the publisher’s camera position (forward or selfie mode).

| Feature       | Methods       |
| ------------- | ------------- |
| Subscriber audio.   | `subscriberAudioButtonPressed` |
| Subscriber video.   | `subscriberVideoButtonPressed`  |
| Publisher audio.      | `publisherMicrophoneButtonPressed`  |
| Publisher start and end call. | `publisherCallButtonPressed `  |
| Publisher video. | `publisherVideoButtonPressed`  |
| Publisher camera orientation (forward or selfie mode). | `publisherCameraButtonPressed`  |


## Requirements

To develop your one-to-one communication app:

1. Install Xcode version 5 or later.
2. Review the [OpenTok iOS SDK Requirements](https://tokbox.com/developer/sdks/ios/).
