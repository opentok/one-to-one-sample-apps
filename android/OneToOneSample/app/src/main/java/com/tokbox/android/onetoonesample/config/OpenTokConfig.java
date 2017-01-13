package com.tokbox.android.onetoonesample.config;

public class OpenTokConfig {

    // *** Fill the following variables using your own Project info from the OpenTok dashboard  ***
    // ***                      https://dashboard.tokbox.com/projects                           ***
    // Replace with a generated Session ID
    public static final String SESSION_ID = "2_MX4xMDB-flR1ZSBOb3YgMTkgMTE6MDk6NTggUFNUIDIwMTN-MC4zNzQxNzIxNX4";
    // Replace with a generated token (from the dashboard or using an OpenTok server SDK)
    public static final String TOKEN = "T1==cGFydG5lcl9pZD0xMDAmc2RrX3ZlcnNpb249dGJwaHAtdjAuOTEuMjAxMS0wNy0wNSZzaWc9MjFkZTliMWQ3MzRiZmJiYjY0MTlkZjRhNjhjYzIyM2VkM2Q0YmMxYjpzZXNzaW9uX2lkPTJfTVg0eE1EQi1mbFIxWlNCT2IzWWdNVGtnTVRFNk1EazZOVGdnVUZOVUlESXdNVE4tTUM0ek56UXhOekl4Tlg0JmNyZWF0ZV90aW1lPTE0ODQzMDEzNTcmcm9sZT1tb2RlcmF0b3Imbm9uY2U9MTQ4NDMwMTM1Ny40NzYyNDc4ODMzMjImZXhwaXJlX3RpbWU9MTQ4Njg5MzM1Nw==";
    // Replace with your OpenTok API key
    public static final String API_KEY = "100";

    // Subscribe to a stream published by this client. Set to false to subscribe
    // to other clients' streams only.
    public static final boolean SUBSCRIBE_TO_SELF = false;

    // For internal use only. Please do not modify or remove this code.
    public static final String LOG_CLIENT_VERSION = "android-vsol-1.3.0";
    public static final String LOG_COMPONENTID = "oneToOneSample";
    public static final String LOG_ACTION_INITIALIZE = "Init";
    public static final String LOG_ACTION_START_COMM = "Start";
    public static final String LOG_ACTION_END_COMM = "End";

    public static final String LOG_VARIATION_ATTEMPT = "Attempt";
    public static final String LOG_VARIATION_ERROR = "Failure";
    public static final String LOG_VARIATION_SUCCESS = "Success";

}