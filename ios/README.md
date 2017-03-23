![logo](../tokbox-logo.png)

# OpenTok Screensharing with Annotations Sample App for iOS<br/>Version 1.1.0

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

1. In XCode, open **AppDelegate.h** and add [OTAcceleratorPackUtil](https://cocoapods.org/pods/OTAcceleratorPackUtil) by `#import <OTAcceleratorPackUtil/OTAcceleratorPackUtil.h>`

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

For details about developing with the SDK and the APIs this sample uses, see [Requirements](#requirements), the [OpenTok iOS SDK Requirements](https://tokbox.com/developer/sdks/ios/) and the [OpenTok iOS SDK Reference](https://tokbox.com/developer/sdks/ios/reference/).

_**NOTE:** This sample app collects anonymous usage data for internal TokBox purposes only. Please do not modify or remove any logging code from this sample application._

### Screen sharing and annotation features

The `OTScreenSharer` and `OTAnnotationScrollView` classes are the backbone of the screen sharing and annotation features for the app.

```objc
self.screenSharer = [OTScreenSharer sharedInstance];
[self.screenSharer connectWithView:<# view you want ot share #>
                            handler:^(OTScreenShareSignal signal, NSError *error) {

                            }];
```

If you want to draw on the sharing screen, the frame of `self.annotationView` should be eqaul to the bounds of the sharing UIView instance.

```objc
self.annotationView = [[OTAnnotationScrollView alloc] init];
self.annotationView.frame = <# desired frame #>;
[self.annotationView initializeToolbarView];
self.annotationView.toolbarView.frame = <# desired frame #>;
```

## Requirements

To develop a screen sharing with annotations app:

1. Install Xcode version 5 or later.
1. Review the [OpenTok iOS SDK Requirements](https://tokbox.com/developer/sdks/ios/).

_You do not need the OpenTok iOS SDK to use this sample._
