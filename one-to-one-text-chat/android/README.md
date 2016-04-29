![logo](../tokbox-logo.png)

# OpenTok Text Chat Sample App for Android<br/>Version 0.9

This document describes how to use the OpenTok Text Chat Accelerator Pack for Android. Through the exploration of the OpenTok Text Chat Sample App, you will learn best practices for exchanging text messages on an Android mobile device.  

You can configure and run this sample app within just a few minutes!


This guide has the following sections:

* [Prerequisites](#prerequisites): A checklist of everything you need to get started.
* [Quick start](#quick-start): A step-by-step tutorial to help you quickly import and run the sample app.
* [Exploring the code](#exploring-the-code): This describes the sample app code design, which uses recommended best practices to implement the text chat features. 

## Prerequisites

To be prepared to develop your text chat app:

1. Install [Android Studio](http://developer.android.com/intl/es/sdk/index.html).
2. Download the [TokBox Common Accelerator Session Pack](https://github.com/opentok/acc-pack-common).
3. Download the **Text Chat Accelerator Pack AAR** file provided by TokBox.
4. Review the [OpenTok Android SDK Requirements](https://tokbox.com/developer/sdks/android/#developerandclientrequirements).
5. Your app will need a **Session ID**, **Token**, and **API Key**, which you can get at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/).

_**NOTE**: The OpenTok Developer Dashboard allows you to quickly run this sample program. For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/)._

## Quick start

To get up and running quickly with your app, go through the following steps in the tutorial provided below:

1. [Importing the Android Studio Project](#importing-the-android-studio-project)
2. [Adding the TokBox Common Accelerator Session Pack](#addaccpackcommon)
3. [Adding the OpenTok Text Chat Accelerator Pack library](#addlibrary)
4. [Configuring the app](#configuring-the-app)

To learn more about the best practices used to design this app, see [Exploring the code](#exploring-the-code).

### Importing the Android Studio project

1. Clone the OpenTok Text Chat Sample App repository.
2. Start Android Studio. 
3. In the **Quick Start** panel, click **Open an existing Android Studio Project**.
4. Navigate to the **android** folder, select the **TextChatSample** folder, and click **Choose**.

<h3 id=addaccpackcommon>Adding the TokBox Common Accelerator Session Pack</h3>
1. Right-click the app name and select **New > Module > Import Gradle Project**.
2. Navigate to the directory in which you cloned **TokBox Common Accelerator Session Pack**, select **android-acc-pack**, and click **Finish**.
3. Open the **build.gradle** file for the app and ensure the following lines have been added to the `dependencies` section:
```
compile project(':android-acc-pack')
compile project(':opentok-text-chat-acc-pack-1.0')
```


<h3 id=addlibrary> Adding the OpenTok Text Chat Accelerator Pack library</h3>
1.  Right-click the app name and select **Open Module Settings** and click **+**.
2.  Select **Import .JAR/.AAR Package** and click  **Next**.
3.  Browse to the **Text Chat Accelerator Pack library AAR** and click **Finish**.



### Configuring the app

Now you are ready to add the configuration detail to your app. These will include the **Session ID**, **Token**, and **API Key** you retrieved earlier (see [Prerequisites](#prerequisites)).

In **OpenTokConfig.java**, replace the following empty strings with the required detail:


```java
// Replace with a generated Session ID
public static final String SESSION_ID = "";

// Replace with a generated token
public static final String TOKEN = "";

// Replace with your OpenTok API key
public static final String API_KEY = "";
```


You may also set the `SUBSCRIBE_TO_SELF` constant. Its default value, `false`, means that the app subscribes automatically to the other client’s stream. This is required to establish communication between two streams using the same Session ID:

```java
public static final boolean SUBSCRIBE_TO_SELF = false;
```

_At this point you can try running the app! You can either use a simulator or an actual mobile device._


## Exploring the code

This section describes how the sample app code design uses recommended best practices to deploy the text chat communication features. The sample app design extends the [OpenTok One-to-One Communication Sample App](https://github.com/opentok/one-to-one-sample-apps) by adding logic using the `com.tokbox.android.textchat` classes.

For detail about the APIs used to develop this sample, see the [OpenTok Android SDK Reference](https://tokbox.com/developer/sdks/android/reference/) and [Android API Reference](http://developer.android.com/reference/packages.html).

  - [Class design](#class-design)
  - [Text Chat Accelerator Pack](#text-chat-accelerator-pack)
  - [User interface](#user-interface)

_**NOTE:** The sample app contains logic used for logging. This is used to submit anonymous usage data for internal TokBox purposes only. We request that you do not modify or remove any logging code in your use of this sample application._

### Class design

The following classes represent the software design for this sample app, focusing primarily on the text chat features. For details about the one-to-one communication aspects of the design, see the [OpenTok One-to-One Communication Sample App](https://github.com/opentok/one-to-one-sample-apps).

| Class        | Description  |
| ------------- | ------------- |
| `MainActivity`    | Implements the sample app UI and text chat callbacks. |
| `OpenTokConfig`   | Stores the information required to configure the session and connect to the cloud.   |
| `TextChatFragment`   | Provides the initializers and methods for the client text chat UI views. |
| `TextChatFragment.TextChatListener`   | Monitors both receiving and sending activity. For example, a message is successfully sent, or a message is sent with a code in the event of an error. |
| `ChatMessage`   | A data model describing information used in individual text chat messages. |


###  Text Chat Accelerator Pack

The `TextChatFragment` class is the backbone of the text chat communication features for the app. 

This class, which inherits from the [`android.support.v4.app.Fragment`](http://developer.android.com/intl/es/reference/android/support/v4/app/Fragment.html) class, sets up the text chat UI views and events, sets up session listeners, and defines a listener interface that is implemented in this example by the `MainActivity` class.

```java
public class TextChatFragment extends Fragment implements AccPackSession.SignalListener, AccPackSession.SessionListener {

    . . .

}
```

The `TextChatListener` interface monitors state changes in the `TextChatFragment`, and defines the following methods:

```java
public interface TextChatListener {

        void onNewSentMessage(ChatMessage message);
        void onNewReceivedMessage(ChatMessage message);
        void onTextChatError(String error);
        void onClose();
        void onMinimize();
        void onMaximize();
}
```




#### Initialization methods

The following `TextChatFragment` methods are used to initialize the app and provide basic information determining the behavior of the text chat functionality.

| Feature        | Methods  |
| ------------- | ------------- |
| Set the maximum chat text length.   | `setMaxTextLength()`  |
| Set the sender alias of the outgoing messages.  | `setSenderAlias()`  |
| Set the listener object to monitor state changes.   | `setListener()` |


For example, the following private method instantiates a `TextChatFragment` object, setting the maximum message length to 1050 characters.

```java
    private void initTextChatFragment(){
        mTextChatFragment = new TextChatFragment(mComm.getSession());
        mTextChatFragment.setMaxTextLength(1050);
        mTextChatFragment.setSenderAlias("user1");
        mTextChatFragment.setListener(this);

        getSupportFragmentManager().beginTransaction()
                .add(R.id.textchat_fragment_container, mTextChatFragment).commit();
    }
```


#### Sending and receiving messages

By implementing the `TextChatFragment.TextChatListener` interface, the `MainActivity` class defines methods that monitor both receiving and sending activity. For example, a message is successfully sent, or a message is sent with a code in the event of an error. 

The method implementations shown below use the `ChatMessage` object to send and receive messages. 

The `onNewSentMessage()` method uses the [OpenTok signaling API](https://tokbox.com/developer/sdks/android/reference/com/opentok/android/Session.html#sendSignal(java.lang.String,%20java.lang.String)) to send an individual chat message to the other client connected to the OpenTok session.

The `onNewReceivedMessage()` method uses the `ChatMessage` object to build and display the individual chat message received from the other client.


```java
    @Override
    public void onNewSentMessage(ChatMessage message) {
        Log.i(LOG_TAG, "New sent message");
    }

    @Override
    public void onNewReceivedMessage(ChatMessage message) {
        Log.i(LOG_TAG, "New received message");
    }
```



### User interface

As described in [Class design](#class-design), the `TextChatFragment` class sets up and manages the UI views, events, and rendering for the chat text controls:

   - `TextChatFragment`


This class works with the following `MainActivity` methods, which manage the views as both clients participate in the session.

| Feature        | Methods  |
| ------------- | ------------- |
| Manage the UI containers. | `onCreate()`  |
| Reload the UI views whenever the device [configuration](http://developer.android.com/reference/android/content/res/Configuration.html), such as screen size or orientation, changes. | `onConfigurationChanged()`  |
| Opens and closes the text chat view. | `onTextChat()` |
| Manage the customizable views for the action bar and messages.   | `getSendMessageView()`, `setSendMessageView()`, `getActionBar()`,  `setActionBar()`|







