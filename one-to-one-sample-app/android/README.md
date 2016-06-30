![logo](../../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for Android<br/>Version 1.1

This document describes how to use the OpenTok One-to-One Communication Sample App for Android. You will learn best practices for managing the audio, video, and camera elements on an Android mobile device. We recommend this is as your first step in delivering interoperable, production-quality audio/video solutions on the OpenTok platform. 

You can configure and run this sample app within just a few minutes!


This guide has the following sections:

* [Prerequisites](#prerequisites): A checklist of everything you need to get started.
* [Quick start](#quick-start): A step-by-step tutorial to help you quickly import and run the sample app.
* [Exploring the code](#exploring-the-code): This describes the sample app code design, which uses recommended best practices to implement the one-to-one communication features. 

## Prerequisites

To be prepared to develop your one-to-one communication app:

1. Install [Android Studio](http://developer.android.com/intl/es/sdk/index.html)
2. Download the [OpenTok Android SDK](https://tokbox.com/developer/sdks/android/). **OpenTok Android SDK version 2.8.x** is required for this sample app.
3. Review the [OpenTok Android SDK Requirements](https://tokbox.com/developer/sdks/android/#developerandclientrequirements)
4. Your app will need a **Session ID**, **Token**, and **API Key**, which you can get at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/).

_**NOTE**: The OpenTok Developer Dashboard allows you to quickly run this sample program. For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/)._

## Quick start

To get up and running quickly with your app, go through the following steps in the tutorial provided below:

1. [Importing the Android Studio Project](#importing-the-android-studio-project)
2. [Adding the OpenTok SDK](#adding-the-opentok-sdk)
3. [Configuring the App](#configuring-the-app)

To learn more about the best practices used to design this app, see [Exploring the code](#exploring-the-code).

### Importing the Android Studio project

1. Clone the OpenTok One-to-One Communication Sample App repository.
2. Start Android Studio. 
3. In the **Quick Start** panel, click **Open an existing Android Studio Project**.
4. Navigate to the **android** folder, select the **OnetoOneSample** folder, and click **Choose**.


### Adding the OpenTok SDK included in the Accelerator Pack Common for Android

There are 2 options for installing the OpenTok Android Accelerator Pack:


#### Using the repository

1. Clone the [OpenTok Accelerator Pack repo](https://github.com/opentok/acc-pack-common).
2. From your app project, right-click the app name and select **New > Module > Import Gradle Project**.
3. Navigate to the directory in which you cloned **OpenTok Accelerator Pack**, select **android-accelerator-pack**, and click **Finish**.
4. Open the **build.gradle** file for the app and ensure the following lines have been added to the `dependencies` section:

```
compile project(':android-accelerator-pack')

```

#### Using Maven

<ol>

<li>Modify the <b>build.gradle</b> for your solution and add the following code snippet to the section labeled 'repositories’:

<code>
maven { url  "http://tokbox.bintray.com/maven" }
</code>

</li>

<li>Modify the <b>build.gradle</b> for your activity and add the following code snippet to the section labeled 'dependencies’: 


<code>
compile 'com.opentok.android:accelerator-pack:1.0.0'
</code>

</li>

</ol>


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

You can enable or disable the `SUBSCRIBE_TO_SELF` feature by invoking the `OneToOneCommunication.setSubscribeToSelf()` method:

```java
OneToOneCommunication comm = new OneToOneCommunication(
  MainActivity.this, 
  OpenTokConfig.SESSION_ID, 
  OpenTokConfig.TOKEN, 
  OpenTokConfig.API_KEY
);

comm.setSubscribeToSelf(OpenTokConfig.SUBSCRIBE_TO_SELF);

```

_At this point you can try running the app! You can either use a simulator or an actual mobile device._


## Exploring the code

This section describes how the sample app code design uses recommended best practices to implement the one-to-one communication features. 

For detail about the APIs used to develop this sample, see the [OpenTok Android SDK Reference](https://tokbox.com/developer/sdks/android/reference/) and [Android API Reference](http://developer.android.com/reference/packages.html).

  - [Class design](#class-design)
  - [Session and stream management](#session-and-stream-management)
  - [User interface](#user-interface)
  - [Audio, video, camera](#audio-video-camera)

_**NOTE:** The sample app contains logic used for logging. This is used to submit anonymous usage data for internal TokBox purposes only. We request that you do not modify or remove any logging code in your use of this sample application._

### Class design

The following classes represent the software design for this sample app.

| Class        | Description  |
| ------------- | ------------- |
| `MainActivity`    | Implements the UI and media control callbacks. |
| `OpenTokConfig`   | Stores the information required to configure the session and authorize the app to make requests to the backend server.   |
| `PreviewControlFragment`   | Manages the toolbar for the local audio and video controls, and the start/end call button. |
| `RemoteControlFragment`   | Manages the icons to enable/disable the audio and video of the remote subscriber. |
| `PreviewCameraFragment `   | Manages the camera control. |


### Session and stream management

The `OneToOneCommunication` class, included in the Accelerator Pack Common for Android, is the backbone of the one-to-one communication features for the app. 

This class uses the OpenTok API to initiate the client connection to the OpenTok session and manage the audio and video streams.

```java
public class OneToOneCommunication implements
        Session.SessionListener, 
        Publisher.PublisherListener, 
        Subscriber.SubscriberListener, 
        Subscriber.VideoListener {
   . . .
}
```

#### Interfaces implemented by the class

The `OneToOneCommunication` class implements the interfaces described in the following table. See their descriptions in the [OpenTok Android SDK Reference](https://tokbox.com/developer/sdks/android/reference/) for information about the methods required to implement them. 


| Interface        | Description  |
| ------------- | ------------- |
| [`Session.SessionListener`](https://tokbox.com/developer/sdks/android/reference/com/opentok/android/Session.SessionListener.html)   | Monitors session state, handling client connections and stream events. |
| [`Publisher.PublisherListener`](https://tokbox.com/developer/sdks/android/reference/com/opentok/android/PublisherKit.PublisherListener.html)      | Monitors publisher stream events.  |
| [`Subscriber.SubscriberListener`](https://tokbox.com/developer/sdks/android/reference/com/opentok/android/SubscriberKit.SubscriberListener.html) | Monitors subscriber events.  |
| [`Subscriber.VideoListener`](https://tokbox.com/developer/sdks/android/reference/com/opentok/android/SubscriberKit.VideoListener.html) | Monitors subscriber video events.  |


#### Methods

The following `OneToOneCommunication` methods are used for session and stream management, and in most cases are required by the interfaces implemented by the class.

| Feature        | Methods  |
| ------------- | ------------- |
| Manage the session connections.   | `start()`, `end()`, `isStarted()`, `onConnected()`, `onDisconnected()`, `isRemote()`  |
| Manage the subscription streams.  | `onStreamCreated()`, `onStreamDestroyed()`, `onStreamReceived()`, `onStreamDropped()`  |
| Manage audio events.              | `getLocalAudio()`, `getRemoteAudio()` |
| Manage video events.              | `getLocalVideo()`, `getRemoteVideo()`, `onVideoDataReceived()`,`onVideoEnabled()`, `onVideoDisableWarning()`, `onVideoDisableWarningLifted()` |
| Manage camera events.              | `swapCamera()` |




### User interface

As described in [Class design](#class-design), the following classes set up and manage the UI fragments for the local and remote controls:

   - `PreviewControlFragment`
   - `RemoteControlFragment`
   - `PreviewCameraFragment`


These classes work with the following `MainActivity` methods, which manage the views as the publisher and subscriber participate in the session.

| Feature        | Methods  |
| ------------- | ------------- |
| Manage the UI containers. | `onCreate()`  |
| Reload the UI views whenever the device [configuration](http://developer.android.com/reference/android/content/res/Configuration.html), such as screen size or orientation, changes. | `onConfigurationChanged()`  |
| Manage the UI for local and remote controls. | `onDisableLocalAudio()`, `onDisableLocalVideo()`, `onCall()`, `onDisableRemoteAudio()`, `onDisableRemoteVideo()`, `showRemoteControlBar()`, `onCameraSwap()` |

You can also create custom UI responses to OpenTok events fired in your implementation of the `OneToOneCommunication.Listener` interface. For example, if a communication error occurs, you can develop and display a custom alert in the `MainActivity` class.



### Audio, video, camera

The following `OneToOneCommunication` methods are used to manage the local and remote media devices.

| Feature        | Methods  |
| ------------- | ------------- |
|  Enable and disable local audio and video.  | `enableLocalMedia(MediaType, boolean)`<br/> `MediaType ` is `AUDIO` or `VIDEO`<br/>`true` (enabled) or `false` (disabled) |
|  Enable and disable remote audio and video.  | `enableRemoteMedia(MediaType, boolean)`<br/> `MediaType ` is `AUDIO` or `VIDEO`<br/>`true` (enabled) or `false` (disabled) |
|  Swap between multiple cameras on a device (normal and selfie modes).  | `swapCamera()` |









