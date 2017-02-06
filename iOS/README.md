![logo](../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for iOS<br/>Version 1.3

## Quick start

This section shows you how to prepare, build, and run the sample application. The app is built by the [Accelerator Core iOS](https://github.com/opentok/accelerator-core-ios).

### Install the project files

Use CocoaPods to install the project files and dependencies.

1. Install CocoaPods as described in [CocoaPods Getting Started](https://guides.cocoapods.org/using/getting-started.html#getting-started).
1. In Terminal, `cd` to your project directory and type `pod install`.
1. Reopen your project in Xcode using the new `*.xcworkspace` file.

### Configure and build the app

Configure the sample app code. Then, build and run the app.

1. Get values for **API Key**, **Session ID**, and **Token**. See [OpenTok One-to-One Communication Sample App home page](../README.md) for important information.

1. Replace the following empty strings with the corresponding **API Key**, **Session ID**, and **Token** values:

    ```objc
    - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

        // Override point for customization after application launch.    
        [OTAcceleratorSession setOpenTokApiKey:@""
                                     sessionId:@""
                                         token:@""];
        return YES;
    }
    ```

1. Use Xcode to build and run the app on an iOS simulator or device.

## Exploring the code

For detail about the APIs used to develop this sample, see the [OpenTok iOS SDK Reference](https://tokbox.com/developer/sdks/ios/reference/).

_**NOTE:** This sample app collects anonymous usage data for internal TokBox purposes only. Please do not modify or remove any logging code from this sample application._

### Session and stream management

The `OTOneToOneCommunicator` class is the backbone of the one-to-one communication features for the app. This class conforms to the protocols that initiate the client connection to the OpenTok session and sets up the listeners for the publisher and subscriber streams:

```objc
[self.oneToOneCommunicator connectWithHandler:^(OTOneToOneCommunicationSignal signal, NSError *error) {
    if (!error) {
        if (signal == OTSessionDidConnect) {
            // publisher view is available, now you can add subscriber view to your desired view
        }
        else if (signal == OTSubscriberDidConnect) {
            // subscriber view is available, now you can add subscriber view to your desired view
        }
    }
    else {
        
    }
}];
```

The following enum notifies the main controller of all session, publisher, and subscriber events:

```objc
typedef NS_ENUM(NSUInteger, OTOneToOneCommunicationSignal) {
    OTSessionDidConnect = 0,
    OTSessionDidDisconnect,
    OTSessionDidFail,
    OTSessionStreamCreated,
    OTSessionStreamDestroyed,
    OTSessionDidBeginReconnecting,
    OTSessionDidReconnect,
    OTPublisherDidFail,
    OTPublisherStreamCreated,
    OTPublisherStreamDestroyed,
    OTSubscriberDidConnect,
    OTSubscriberDidFail,
    OTSubscriberVideoDisabledByPublisher,
    OTSubscriberVideoDisabledBySubscriber,
    OTSubscriberVideoDisabledByBadQuality,
    OTSubscriberVideoEnabledByPublisher,
    OTSubscriberVideoEnabledBySubscriber,
    OTSubscriberVideoEnabledByGoodQuality,
    OTSubscriberVideoDisableWarning,
    OTSubscriberVideoDisableWarningLifted,
};
```
## Requirements

To develop your one-to-one communication app:

1. Install Xcode version 5 or later.
2. Review the [OpenTok iOS SDK Requirements](https://tokbox.com/developer/sdks/ios/).
