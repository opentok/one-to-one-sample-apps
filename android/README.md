![logo](../tokbox-logo.png)

# OpenTok One-to-One Communication Sample App for Android

## Quick start

This section shows you how to prepare, build, and run the sample application.

### Install the project files

1. Clone the [OpenTok One-to-One Communication Sample App for Android repository](https://github.com/opentok/one-to-one-sample-apps/tree/master/android) from GitHub.
1. Start Android Studio.
1. In the **Quick Start** panel, click **Open an existing Android Studio Project**.
1. Navigate to the **android** folder, select the **OnetoOneSample** folder, and click **Choose**.


### Add the Accelerator Core Android

There are two options for installing the OpenTok SDK included in the Accelerator Pack Common for Android:


#### Using the repository

1. Clone the [OpenTok Accelerator Core repo](https://github.com/opentok/accelerator-core-android).
2. From your app project, right-click the app name and select **New > Module > Import Gradle Project**.
3. Navigate to the directory in which you cloned **OpenTok Accelerator Pack**, select **accelerator-core**, and click **Finish**.
4. Open the **build.gradle** file for the app and ensure the following lines have been added to the `dependencies` section:

```
compile project(':accelerator-core-android')

```

#### Using Maven

1. Modify the `build.gradle` for your solution and add the following code snippet to the section labeled `repositories`:

  ```gradle
    maven { url  "http://tokbox.bintray.com/maven" }
  ```

1. Modify the `build.gradle` for your activity and add the following code snippet to the section labeled `dependencies`:
  
  ```gradle
    compile 'com.opentok.android:accelerator-core-android:+'
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

  ```java
    //init the wrapper
    OTConfig config =
          new OTConfig.OTConfigBuilder(OpenTokConfig.SESSION_ID, OpenTokConfig.TOKEN,
            OpenTokConfig.API_KEY).name("one-to-one-sample-app").subscribeAutomatically(true).subscribeToSelf(false).build();
    
    if ( config != null ) {
      mWrapper = new OTWrapper(MainActivity.this, config);
      mWrapper.addBasicListener(mBasicListener);
      mWrapper.addAdvancedListener(mAdvancedListener);

      //...
    }
  ```

## Exploring the code

This section describes best practices the sample app code uses to implement the one-to-one communication features.

For detail about the APIs used to develop this sample, see the [OpenTok Android SDK Reference](https://tokbox.com/developer/sdks/android/reference/) and [Android API Reference](http://developer.android.com/reference/packages.html).


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

The `OTWrapper` class, included in the Accelerator Core for Android, is the backbone of the one-to-one communication features for the app.

This class uses the OpenTok API to initiate the client connection to the OpenTok session and manage the audio and video streams.
```java
  
  mWrapper.connect();
  
  mWrapper.startPublishingMedia(new PreviewConfig.PreviewConfigBuilder().
                        name("Tokboxer").build(), false);

  mWrapper.enableLocalMedia(MediaType.AUDIO, audio);
  
  mWrapper.disconnect();

```

The BasicListener and AdvancedListener interface monitor state changes in the communication, and defines the following methods:

```java
  //Basic Listener from OTWrapper
  private BasicListener mBasicListener =
    new PausableBasicListener(new BasicListener<OTWrapper>() {
    @Override
    public void onConnected(OTWrapper otWrapper, int participantsCount, String connId, String data) throws ListenerException { //...}
    @Override
    public void onDisconnected(OTWrapper otWrapper, int participantsCount, String connId, String data) throws ListenerException { //...}
    @Override
    public void onPreviewViewReady(OTWrapper otWrapper, View localView) throws ListenerException { //...}
    @Override
    public void onRemoteViewReady(OTWrapper otWrapper, View remoteView, String remoteId, String data) throws ListenerException { //...}
    @Override
    public void onStartedPublishingMedia(OTWrapper otWrapper, boolean screensharing) throws ListenerException { //...}
    //...
  });

```
```java
  //Advanced Listener from OTWrapper
  private AdvancedListener mAdvancedListener =
    new PausableAdvancedListener(new AdvancedListener<OTWrapper>() {
    @Override
    public void onCameraChanged(OTWrapper otWrapper) throws ListenerException { //... }
    @Override
    public void onReconnecting(OTWrapper otWrapper) throws ListenerException { //... }
    @Override
    public void onReconnected(OTWrapper otWrapper) throws ListenerException { //... }
    @Override
    public void onVideoQualityWarning(OTWrapper otWrapper, String remoteId) throws ListenerException { //... }
    //...
  });
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
