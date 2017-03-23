![logo](../tokbox-logo.png)

# OpenTok Accelerator TextChat Sample App

This document describes how to use the OpenTok Text Chat Accelerator Pack for Android. Through the exploration of the One to One Text Chat Sample Application, you will learn best practices for exchanging text messages on an Android mobile device.  

You can configure and run this sample app within just a few minutes!

## Prerequisites

To be prepared to develop your text chat app:

1. Install [Android Studio](http://developer.android.com/intl/es/sdk/index.html).
2. Review the [OpenTok Android SDK Requirements](https://tokbox.com/developer/sdks/android/#developerandclientrequirements).
3. Your app will need a **Session ID**, **Token**, and **API Key**, which you can get at the [OpenTok Developer Dashboard](https://dashboard.tokbox.com/).

_**NOTE**: The OpenTok Developer Dashboard allows you to quickly run this sample program. For production deployment, you must generate the **Session ID** and **Token** values using one of the [OpenTok Server SDKs](https://tokbox.com/developer/sdks/server/)._


## Quick start

To get up and running quickly with your app, go through the following steps in the tutorial provided below:

1. [Importing the sample app](#importing-the-sample-app)
2. [Adding the OpenTok Accelerator TextChat](#adding-the-opentok-accelerator-textchat-library)
3. [Configuring the app](#configuring-the-app)

To learn more about the best practices used to design this app, see [Exploring the code](#exploring-the-code).

### Importing the sample app

1. Clone the [OpenTok TextChat sample app repo](https://github.com/opentok/textchat-acc-pack).
2. Start Android Studio. 
3. In the **Quick Start** panel, click **Open an existing Android Studio Project**.
4. Navigate to the **android** folder, select the **OneToOneTextChatSample** folder, and click **Choose**.

### Adding the OpenTok Accelerator TextChat library

Take a look at [OpenTok Accelerator TextChat repo](https://github.com/opentok/accelerator-textchat-android).


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

_At this point you can try running the app! You can either use a simulator or an actual mobile device._


## Exploring the code

This section describes how the sample app code design uses recommended best practices to deploy the text chat communication features. The sample app design extends the [OpenTok One-to-One Communication Sample App](https://github.com/opentok/one-to-one-sample-apps/tree/master/one-to-one-sample-app/) and [OpenTok Accelerator Core for Android](https://github.com/opentok/accelerator-core-android) by adding logic using the [OpenTok Accelerator TextChat](https://github.com/opentok/accelerator-textchat-android) classes.



