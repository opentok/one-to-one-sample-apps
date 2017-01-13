![logo](../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for Android<br/>Version 1.3

## Quick start

This section shows you how to prepare, build, and run the sample application.

### Install the project files

1. Clone the [OpenTok One-to-One Communication Sample App for Android repository](https://github.com/opentok/one-to-one-sample-apps/tree/master/one-to-one-sample-app/android) from GitHub.
1. Start Android Studio.
1. In the **Quick Start** panel, click **Open an existing Android Studio Project**.
1. Navigate to the **android** folder, select the **OnetoOneSample** folder, and click **Choose**.


### Add the OpenTok SDK

There are two options for installing the OpenTok SDK included in the Accelerator Pack Common for Android:


#### Using the repository

1. Clone the [OpenTok Accelerator Pack repo](https://github.com/opentok/acc-pack-common).
2. From your app project, right-click the app name and select **New > Module > Import Gradle Project**.
3. Navigate to the directory in which you cloned **OpenTok Accelerator Pack**, select **android-accelerator-pack**, and click **Finish**.
4. Open the **build.gradle** file for the app and ensure the following lines have been added to the `dependencies` section:

```
compile project(':android-accelerator-pack')

```

#### Using Maven

1. Modify the `build.gradle` for your solution and add the following code snippet to the section labeled `repositories`:

    ```gradle
    maven { url  "http://tokbox.bintray.com/maven" }
    ```

1. Modify the `build.gradle` for your activity and add the following code snippet to the section labeled `dependencies`:

```gradle
compile 'com.opentok.android:accelerator-pack:+'
```
### Configure and build the app

Configure the sample app code. Then, build and run the app.

1. Get values for **API Key**, **Session ID**, and **Token**. See [OpenTok One-to-One Communication Sample App home page](../README.md) for important information.

In Android Studio, open **OpenTokConfig.java** and replace the following empty strings with the corresponding **API Key**, **Session ID**, and **Token** values:

   ```java
    // Replace with a generated Session ID
    public static final String SESSION_ID = "";

    // Replace with a generated token
    public static final String TOKEN = "";

    // Replace with your OpenTok API key
    public static final String API_KEY = "";
   ```

   To enable or disable the `SUBSCRIBE_TO_SELF` feature, you can invoke the `OneToOneCommunication.setSubscribeToSelf()` method:

   ```java
   public static final boolean SUBSCRIBE_TO_SELF = false;
   ```

   ```java
   OneToOneCommunication comm = new OneToOneCommunication(
     MainActivity.this,
     OpenTokConfig.SESSION_ID,
     OpenTokConfig.TOKEN,
     OpenTokConfig.API_KEY
   );

   comm.setSubscribeToSelf(OpenTokConfig.SUBSCRIBE_TO_SELF);

   ```


## Exploring the code

This section describes best practices the sample app code uses to implement the one-to-one communication features.

For detail about the APIs used to develop this sample, see the [OpenTok Android SDK Reference](https://tokbox.com/developer/sdks/android/reference/) and [Android API Reference](http://developer.android.com/reference/packages.html).

_**NOTE:** This sample app collects anonymous usage data for internal TokBox purposes only. Please do not modify or remove any logging code from this sample application._

### Class design

This section focuses on one-to-one communication features. For more information, see the [OpenTok One-to-One Communication Sample App](https://github.com/opentok/one-to-one-sample-apps).

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


#### Methods

The following `OneToOneCommunication` methods are used for session and stream management.

| Feature        | Methods  |
| ------------- | ------------- |
| Manage session and stream.   | `start()`, `end()`, `init()`, `destroy()`, `isStarted()`, `isRemote()`, `isInitialized()`,  `setRemoteFill()`, `getLocal()`, `getRemote()`, `setSubscribeToSelf()` |
| Manage audio. Enable and disable local audio and video.              | `getLocalAudio()`, `getRemoteAudio()`, `enableLocalMedia(MediaType, boolean)`<br/> `MediaType ` is `AUDIO` or `VIDEO`<br/>`true` (enabled) or `false` (disabled) |
| Manage video. Enable and disable remote audio and video.              | `getLocalVideo()`, `getRemoteVideo()`, `enableRemoteMedia(MediaType, boolean)`<br/> `MediaType ` is `AUDIO` or `VIDEO`<br/>`true` (enabled) or `false` (disabled) |
| Manage camera. Swap between multiple cameras on a device (normal and selfie modes).           | `swapCamera()`, `getCameraId()` |
| Manage views.             | `reloadViews()`, `getRemoteVideoView()`, `getRemoteScreenView()`, `getPreviewView() |

The Listener interface monitors state changes in the OneToOneCommunication, and defines the following methods:

```java
public static interface Listener {
        void onInitialized();
        void onError(String error);
        void onQualityWarning(boolean warning);
        void onAudioOnly(boolean enabled);
        void onPreviewReady(View preview);
        void onRemoteViewReady(View remoteView);
        void onReconnecting();
        void onReconnected();
        void onCameraChanged(int newCameraId);
    }
```

### User interface

As described in [Class design](#class-design), the following classes set up and manage the UI fragments for the local and remote controls:

   - `PreviewControlFragment`
   - `RemoteControlFragment`
   - `PreviewCameraFragment`


These classes work with the following `MainActivity` methods, which manage the views as the publisher and subscriber participate in the session.

## Requirements

To develop your one-to-one communication app:

1. Install [Android Studio](http://developer.android.com/intl/es/sdk/index.html)
1. Review the [OpenTok Android SDK Requirements](https://tokbox.com/developer/sdks/android/#developerandclientrequirements)
