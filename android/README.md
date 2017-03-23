![logo](../tokbox-logo.png)

# OpenTok Screensharing with Annotations Sample App for Android<br/>Version 1.1.0

## Quick start

This section shows you how to prepare, build, and run the sample application.

### Install the project files

1. Clone [the OpenTok Screensharing with Annotations Sample App repository](https://github.com/opentok/screensharing-annotation-acc-pack/tree/master/android) from GitHub.
2. Start Android Studio.
3. In the **Quick Start** panel, click **Open an existing Android Studio Project**.
4. Navigate to the **android** folder, select the **OneToOneScreenSharingSample** folder, and click **Choose**.


### Configure and build the app

Configure the sample app code. Then, build and run the app.

1. Get values for **API Key**, **Session ID**, and **Token**. See the [Screensharing Annotation Sample home page](../README.md) for important information.

1. In Android Studio, open **OpenTokConfig.java** and replace the following empty strings with the corresponding **Session ID**, **Token**, and **API Key** values:

    ```java
    // Replace with a generated Session ID
    public static final String SESSION_ID = "";

    // Replace with a generated token
    public static final String TOKEN = "";

    // Replace with your OpenTok API key
    public static final String API_KEY = "";
    ```

1. Use Android Studio to build and run the app on an Android emulator or device.

1. By default, your app does not subscribe to its own stream. This feature is controlled by the following line of code open **OpenTokConfig.java**.

    ```java
    public static final boolean SUBSCRIBE_TO_SELF = false;
    ```

    To enable or disable the `SUBSCRIBE_TO_SELF` feature, you can invoke the `OneToOneCommunication.setSubscribeToSelf()` method:

## Exploring the code

This section describes best practices the sample app code uses to deploy screen sharing with annotations.

The sample app design extends the [OpenTok One-to-One Communication Sample App](https://github.com/opentok/one-to-one-sample-apps/tree/master/one-to-one-sample-app/) and [OpenTok Common Accelerator Session Pack](https://github.com/opentok/acc-pack-common/) by adding logic using the `com.tokbox.android.accpack.screensharing` classes.

For details about developing with the SDK and the APIs this sample uses, see [OpenTok Android SDK Reference](https://tokbox.com/developer/sdks/android/reference/) and [Android API Reference](http://developer.android.com/reference/packages.html).


_**NOTE:** This sample app collects anonymous usage data for internal TokBox purposes only. Please do not modify or remove any logging code from this sample application._

### App design

This section focuses on screen sharing with annotations features. For information about one-to-one communication features, see the [OpenTok One-to-One Communication Sample App](https://github.com/opentok/one-to-one-sample-apps).

| Class        | Description  |
| ------------- | ------------- |
| `MainActivity`    | Implements the sample app UI and screen sharing with annotations callbacks. |
| `OpenTokConfig`   | Stores the information required to configure the session and connect to the cloud.   |
| `PreviewControlFragment`   | Manages the toolbar for the local audio and video controls, the start/end call button and the screensharing and annotations buttons. |
| `RemoteControlFragment`   | Manages the icons to enable/disable the audio and video of the remote subscriber. |
| `PreviewCameraFragment `   | Manages the camera control. |


###  Screen sharing and annotation features

From the [ScreenSharingAccPack](https://github.com/opentok/screen-sharing-acc-pack).

From the [AnnotationsKit](https://github.com/opentok/annotation-acc-pack).

The `ScreenSharingFragment` class is the backbone of the screen sharing features for the app. 

```java
    mScreenSharingFragment = ScreenSharingFragment.newInstance(mComm.getSession(), OpenTokConfig.API_KEY);
    mScreenSharingFragment.setListener(this);
    mScreenSharingFragment.start();
    ...
    mScreenSharingFragment.stop();
```

To enable the annotation feature in the Publisher:

```java
    mScreenSharingFragment.enableAnnotations(true, mAnnotationsToolbar);
```

To enable the annotation feature in the Subscriber:

```java
    try {
      AnnotationsView remoteAnnotationsView = new AnnotationsView(this, mComm.getSession(), OpenTokConfig.API_KEY, mComm.getRemote());
      remoteAnnotationsView.attachToolbar(mAnnotationsToolbar);

      ((ViewGroup) mRemoteViewContainer).addView(remoteAnnotationsView);
          
    } catch (Exception e) {
      Log.i(LOG_TAG, "Exception - enableRemoteAnnotations: " + e);
    }
```

## Requirements

To develop a screen sharing with annotations app:

1. Install [Android Studio](http://developer.android.com/intl/es/sdk/index.html).
2. Review the [OpenTok Android SDK Requirements](https://tokbox.com/developer/sdks/android/#developerandclientrequirements).
3. The device must support Android Lollipop and later.
