![logo](../tokbox-logo.png)

# OpenTok Text Chat Sample App for iOS<br/>Version 0.9

This document describes how to use the OpenTok Text Chat Accelerator Pack for iOS. Through the exploration of the OpenTok Text Chat Sample App, you will learn best practices for exchanging text messages on an iOS mobile device.

You can configure and run this sample app within just a few minutes!


This guide has the following sections:

* [Prerequisites](#prerequisites): A checklist of everything you need to get started.
* [Quick start](#quick-start): A step-by-step tutorial to help you quickly import and run the sample app.
* [Exploring the code](#exploring-the-code): This describes the sample app code design, which uses recommended best practices to implement the text chat features. 

## Prerequisites

To be prepared to develop your text chat app:

1. Install Xcode version 5 or later.
2. Download the [TokBox Common Accelerator Session Pack](https://github.com/opentok/acc-pack-common).
3. Download the **Text Chat Accelerator Pack framework** provided by TokBox.
4. Review the [OpenTok iOS SDK Requirements](https://tokbox.com/developer/sdks/ios/).
5. Your app will need a **Session ID**, **Token**, and **API Key**, which you can get at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/).

_You do not need the OpenTok iOS SDK to use this sample._

_**NOTE**: The OpenTok Developer Dashboard allows you to quickly run this sample program. For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/)._

## Quick start

To get up and running quickly with your app, go through the following steps in the tutorial provided below:

1. [Importing the Xcode Project](#importing-the-xcode-project)
2. [Adding the required frameworks](#adding-the-required-frameworks)
3. [Configuring the app](#configuring-the-app)

To learn more about the best practices used to design this app, see [Exploring the code](#exploring-the-code).

### Importing the Xcode project

1. Clone the OpenTok Text Chat Sample App repository.
2. Start Xcode. 
3. Click **File > Open**.
4. Navigate to the **iOS** folder, select **OneToOneTextChatSample.xcodeproj**, and click **Open**.


### Adding the required frameworks

1. Copy the **TextChatKit.framework** into your project folder. 
2. From the **Project Navigator** view, select each and ensure **Target Membership** is checked in the **File Inspector**.
3. From the **Project Navigator** view, click **General**. Ensure that **TextChatKit.framework** has been added to **Embedded Binaries**.



### Configuring the app

Now you are ready to add the configuration detail to your app. These will include the **Session ID**, **Token**, and **API Key** you retrieved earlier (see [Prerequisites](#prerequisites)).

In **AppDelegate.h**, replace the following empty strings with the required detail:


   ```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

	// Override point for customization after application launch.    
    [OneToOneCommunicator setOpenTokApiKey:@""
                                 sessionId:@""
                                     token:@""
                            selfSubscribed:NO];
  	return YES;
}
   ```


You may also set the `selfSubscribed` constant. Its default value, `NO`, means that the app subscribes automatically to the other client’s stream. This is required to establish communication between two streams using the same Session ID.

_At this point you can try running the app! You can either use a simulator or an actual mobile device._


## Exploring the code

This section describes how the sample app code design uses recommended best practices to deploy the text chat communication features. The sample app design extends the [OpenTok One-to-One Communication Sample App](https://github.com/opentok/one-to-one-sample-apps) by adding logic using the classes in the `TextChatKit` framework.

For detail about the APIs used to develop this sample, see the [OpenTok iOS SDK Reference](https://tokbox.com/developer/sdks/ios/reference/).

  - [App design](#app-design)
  - [Text Chat view](#text-chat-view)
  - [User interface](#user-interface)

_**NOTE:** The sample app contains logic used for logging. This is used to submit anonymous usage data for internal TokBox purposes only. We request that you do not modify or remove any logging code in your use of this sample application._

### App design

The following classes, interfaces, and protocols represent the software design for this sample app, focusing primarily on the text chat features. For details about the one-to-one communication aspects of the design, see the [OpenTok One-to-One Communication Sample App](https://github.com/opentok/one-to-one-sample-apps).

| Class        | Description  |
| ------------- | ------------- |
| `MainViewController`   | In conjunction with **Main.storyboard**, this class uses the OpenTok API to initiate the client connection to the OpenTok session, and implements the sample UI and text chat callbacks.   |
| `TextChatView`   | Provides the initializers and methods for the client text chat UI views. |
| `TextChatViewDelegate`   | Delegate that monitors both receiving and sending activity. For example, a message is successfully sent, or a message is sent with a code in the event of an error. |


### Text Chat view

The `TextChatView` class is the backbone of the text chat features for the app. It serves as a controller for the text chat UI widget, and defines delegates for exchanging messages that are implemented in this example by the `MainViewController` class:

```objc
@interface TextChatView : UIView
​
+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token;
​
@property (weak, nonatomic) id<TextChatViewDelegate> delegate;
@property (readonly, nonatomic) BOOL isShown;
​
+ (instancetype)textChatView;

+ (instancetype)textChatViewWithBottomView:(UIView *)bottomView;
​
- (void)connect;

- (void)disconnect;
​
- (void)minimize;

- (void)maximize;

- (void)show;

- (void)dismiss;

- (void)setAlias:(NSString *)alias;

- voidsetMaximumTextMessageLength:(NSUInteger)length;
@end
```


#### Initialization methods

The following `TextChatView` methods are used to initialize the text chat features so the client can send and receive text messages.

| Feature        | Methods  |
| ------------- | ------------- |
| Initialize the text chat view. | `textChatView()`, `textChatViewWithBottomView()` |
| Set the maximum chat text length.   | `setMaximumTextMessageLength()`  |
| Set the sender alias and the sender ID of the outgoing messages.  | `setAlias()`  |


For example, the following method in `MainViewController` instantiates and initializes a `TextChatView` object, setting the maximum message length to 200 characters.

```objc
- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.mainView = (MainView *)self.view;
    self.oneToOneCommunicator = [OneToOneCommunicator oneToOneCommunicator];
    self.textChatView = [TextChatView textChatViewWithBottomView:self.mainView.actionButtonsHolder];
    self.textChatView.delegate = self;
    [self.textChatView setMaximumTextMessageLength:200]
    [self.textChatView setAlias:@“Tokboxer”];
}
```

#### Sending and receiving messages

By conforming to the `TextChatViewDelegate`, the `MainVewController` class defines methods that determine the UI responses to chat events. When a user clicks the send button, a `didAddMessageWithError` event is received.

In order to signal sending a message, you must first call the `connect` method. This allows you to begin using the `TextChatViewDelegate` protocol to receive notifications about messages being sent and received.

```objc
[self.textChatView connect];
```

Once you no longer need to exchange messages, call the `disconnect` method to leave the session.

The method implementations use the [OpenTok signaling API](https://tokbox.com/developer/sdks/ios/reference/Protocols/OTSessionDelegate.html#//api/name/session:receivedSignalType:fromConnection:withString:), which monitors the session connections to determine when individual chat messages are sent and received. 


```objc
@protocol TextChatViewDelegate <NSObject>
- (void)textChatViewDidSendMessage:(TextChatView *)textChatView
                             error:(NSError *)error;
- (void)textChatViewDidReceiveMessage:(TextChatView *)textChatView;

@optional
- (void)didConnectWithError:(NSError *)error;
- (void)didDisConnectWithError:(NSError *)error;
@end
```



### User interface

As described in [App design](#app-design), the `TextChatView` class sets up and manages the UI views and rendering for the local and remote controls.


These properties of the `ViewController` class manage the views as the publisher and subscriber participate in the session.

| Property        | Description  |
| ------------- | ------------- |
| `textChatView` | UI view for the text chat widget  |
| `mainView` | Main UI view  |











