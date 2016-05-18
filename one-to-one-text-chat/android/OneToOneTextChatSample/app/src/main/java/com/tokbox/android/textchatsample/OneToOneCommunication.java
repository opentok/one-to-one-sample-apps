package com.tokbox.android.textchatsample;

import android.content.Context;
import android.util.Log;
import android.view.View;

import com.opentok.android.BaseVideoRenderer;
import com.opentok.android.OpentokError;
import com.opentok.android.Publisher;
import com.opentok.android.PublisherKit;
import com.opentok.android.Session;
import com.opentok.android.Stream;
import com.opentok.android.Subscriber;
import com.opentok.android.SubscriberKit;
import com.tokbox.android.accpack.AccPackSession;
import com.tokbox.android.textchatsample.config.OpenTokConfig;
import com.tokbox.android.accpack.textchat.logging.OTKAnalyticsData;
import com.tokbox.android.accpack.textchat.logging.OTKAnalytics;

import java.util.ArrayList;

public class OneToOneCommunication implements
        AccPackSession.SessionListener, Publisher.PublisherListener, Subscriber.SubscriberListener, Subscriber.VideoListener {

    private static final String LOGTAG = MainActivity.class.getName();
    ;
    private Context mContext;

    private AccPackSession mSession;
    private Publisher mPublisher;
    private Subscriber mSubscriber;
    private ArrayList<Stream> mStreams;

    private boolean isInitialized = false;
    private boolean isStarted = false;
    private boolean mLocalAudio = true;
    private boolean mLocalVideo = true;
    private boolean mRemoteAudio = true;
    private boolean mRemoteVideo = true;

    private boolean isRemote = false;
    private boolean startPublish = false;

    protected Listener mListener;

    private OTKAnalyticsData mAnalyticsData;
    private OTKAnalytics mAnalytics;

    /**
     * Defines values for the {@link #enableLocalMedia(MediaType, boolean)}
     * and {@link #enableRemoteMedia(MediaType, boolean)} methods.
     */
    public enum MediaType {
        AUDIO,
        VIDEO
    };

    /**
     * Monitors OpenTok actions which should be notified to the activity.
     */
    public static interface Listener {

        /**
         * Invoked when the onetoonecommunicator is initialized
         */
        void onInitialized();

        /**
         * Invoked when there is an error trying to connect to the session, publishing or subscribing.
         *
         * @param error The error code and error message.
         */
        void onError(String error);

        /**
         * Invoked when the quality of the network is not really good
         *
         * @param warning Indicates if the platform has run an alert (quality really wrong and video is disabled)
         *                or a warning (quality is poor but the video is not disabled).
         */
        void onQualityWarning(boolean warning);

        /**
         * Invoked when the remote video is disabled.
         * Reasons: the remote stops to publish the video, the quality is wrong and the platform has disabled the video
         * or the video remote control has disabled.
         *
         * @param enabled Indicates the status of the remote video.
         */
        void onAudioOnly(boolean enabled);

        /**
         * Invoked when the preview (publisher view) is ready to be added to the container.
         *
         * @param preview Indicates the publisher view.
         */
        void onPreviewReady(View preview);

        /**
         * Invoked when the remote (subscriber view) is ready to be added to the container.
         *
         * @param remoteView Indicates the subscriber view.
         */
        void onRemoteViewReady(View remoteView);

    }

    public OneToOneCommunication(Context context) {
        this.mContext = context;

        mStreams = new ArrayList<Stream>();
    }

    /**
     * Set 1to1 communication listener.
     */
    public void setListener(Listener listener) {
        mListener = listener;
    }

    public void init() {
        if (mSession == null) {
            mSession = new AccPackSession(mContext,
                    OpenTokConfig.API_KEY, OpenTokConfig.SESSION_ID);

            mSession.setSessionListener(this);
            mSession.connect(OpenTokConfig.TOKEN);
        }
    }

    /**
     * Start the communication.
     */
    public void start() {
        if (mSession != null && isInitialized) {
            //add START_COMM attempt log event
            addLogEvent(OpenTokConfig.LOG_ACTION_START_COMM, OpenTokConfig.LOG_VARIATION_ATTEMPT);
            if (mPublisher == null) {
                mPublisher = new Publisher(mContext, "myPublisher");
                mPublisher.setPublisherListener(this);
                attachPublisherView();
                mSession.publish(mPublisher);
                startPublish = false;
            }
        } else {
            startPublish = true;
            init();
        }
    }

    /**
     * End the communication.
     */
    public void end() {
        if ( mSession != null ) {
            //add END_COMM attempt log event
            addLogEvent(OpenTokConfig.LOG_ACTION_END_COMM, OpenTokConfig.LOG_VARIATION_ATTEMPT);

            if (mPublisher != null) {
                mSession.unpublish(mPublisher);

            }
            if (mSubscriber != null) {
                mSession.unsubscribe(mSubscriber);
                isRemote = false;
            }
            restartViews();
            mPublisher = null;
            mSubscriber = null;
            isStarted = false;
        }
    }

    /**
     * Destroy the communication.
     */
    public void destroy() {
        if ( mPublisher != null ) {
            mSession.unpublish(mPublisher);
            mPublisher = null;
        }
        if ( mSubscriber != null ) {
            mSession.unsubscribe(mSubscriber);
            mSubscriber = null;
        }
        if ( mSession != null ) {
            mSession.disconnect();
        }
    }

    /**
     * Enable/disable the local audio/video
     *
     * @param type  The MediaType value: audio or video
     * @param value Whether to enable video/audio (<code>true</code>) or not (
     *              <code>false</code>).
     */
    public void enableLocalMedia(MediaType type, boolean value) {
        if ( mPublisher != null ) {
            switch (type) {
                case AUDIO:
                    mPublisher.setPublishAudio(value);
                    this.mLocalAudio = value;
                    break;

                case VIDEO:
                    mPublisher.setPublishVideo(value);
                    this.mLocalVideo = value;
                    if (value) {
                        mPublisher.getView().setVisibility(View.VISIBLE);
                    } else {
                        mPublisher.getView().setVisibility(View.GONE);
                    }
                    break;
            }
        }
    }

    /**
     * Enable/disable the remote audio/video
     *
     * @param type  The MediaType value: audio or video
     * @param value Whether to enable video/audio (<code>true</code>) or not (
     *              <code>false</code>).
     */
    public void enableRemoteMedia(MediaType type, boolean value) {
        if ( mSubscriber != null ) {
            switch (type) {
                case AUDIO:
                    mSubscriber.setSubscribeToAudio(value);
                    this.mRemoteAudio = value;
                    break;

                case VIDEO:
                    mSubscriber.setSubscribeToVideo(value);
                    this.mRemoteVideo = value;
                    setRemoteAudioOnly(value ? false : true);
                    break;
            }

        }
    }

    /**
     * Cycles between cameras, if there are multiple cameras on the device.
     */
    public void swapCamera() {
        if ( mPublisher != null ) {
            mPublisher.cycleCamera();
        }
    }

    /**
     * Check if the communication started
     *
     * @return true if the session is connected; false if it is not.
     */
    public boolean isStarted() {
        return isStarted;
    }

    /**
     * Check if the communication started
     *
     * @return true if the session is connected; false if it is not.
     */
    public boolean isInitialized() {
        return isInitialized;
    }

    /**
     * Whether the Local/Publisher is publishing audio or not
     *
     * @return true if the Publisher is publishing audio; false if it is not.
     */
    public boolean getLocalAudio() {
        return mLocalAudio;
    }

    /**
     * Whether the Local/Publisher is publishing video or not
     *
     * @return true if the Publisher is publishing video; false if it is not.
     */
    public boolean getLocalVideo() {
        return mLocalVideo;
    }

    /**
     * Whether the Subscriber/Remote is subscribing to audio or not
     *
     * @return true if the Subscriber is subscribing to audio; false if it is not.
     */
    public boolean getRemoteAudio() {
        return mRemoteAudio;
    }

    /**
     * Whether the Subscriber/Remote is subscribing to video or not
     *
     * @return true if the Subscriber is subscribing to video; false if it is not.
     */
    public boolean getRemoteVideo() {
        return mRemoteVideo;
    }

    /**
     * Whether the Remote is connected or not.
     *
     * @return true if the Remote is connected; false if it is not.
     */
    public boolean isRemote() {
        return isRemote;
    }

    public void reloadViews() {
        if ( mPublisher != null ) {
            attachPublisherView();
        }
        if ( isRemote && mSubscriber != null ) {
            attachSubscriberView(mSubscriber);
        }
    }

    private void subscribeToStream(Stream stream) {
        mSubscriber = new Subscriber(mContext, stream);
        mSubscriber.setVideoListener(this);
        mSubscriber.setSubscriberListener(this);
        mSession.subscribe(mSubscriber);
    }

    private void unsubscribeFromStream(Stream stream) {
        if ( mStreams.size() > 0 ) {
            mStreams.remove(stream);
            isRemote = false;
            onRemoteViewReady(mSubscriber.getView());
            if ( mSubscriber != null && mSubscriber.getStream().equals(stream) ) {
                mSubscriber = null;
                if ( !mStreams.isEmpty() ) {
                    subscribeToStream(mStreams.get(0));
                }
            }
        }
    }

    private void attachPublisherView() {
        mPublisher.setStyle(BaseVideoRenderer.STYLE_VIDEO_SCALE,
                BaseVideoRenderer.STYLE_VIDEO_FILL);
        onPreviewReady(mPublisher.getView());
    }

    private void attachSubscriberView(Subscriber subscriber) {
        subscriber.setStyle(BaseVideoRenderer.STYLE_VIDEO_SCALE,
                BaseVideoRenderer.STYLE_VIDEO_FILL);
        isRemote = true;
        onRemoteViewReady(subscriber.getView());
    }

    private void setRemoteAudioOnly(boolean audioOnly) {
        if ( !audioOnly ) {
            mSubscriber.getView().setVisibility(View.VISIBLE);
            onAudioOnly(false);
        } else {
            mSubscriber.getView().setVisibility(View.GONE);
            onAudioOnly(true);
        }
    }

    private void restartComm() {
        mSubscriber = null;
        isRemote = false;
        isInitialized = false;
        isStarted = false;
        mPublisher = null;
        mLocalAudio = true;
        mLocalVideo = true;
        mRemoteAudio = true;
        mRemoteVideo = true;
        mStreams.clear();
        mSession = null;
    }

    @Override
    public void onStreamCreated(PublisherKit publisherKit, Stream stream) {
        isStarted = true;

        if ( mStreams.size() > 0 ) {
            for ( Stream stream1 : mStreams ) {
                subscribeToStream(stream1);
            }
        }

        if ( OpenTokConfig.SUBSCRIBE_TO_SELF ) {
            mStreams.add(stream);
            if ( mSubscriber == null ) {
                subscribeToStream(stream);
            }
        }
        //add START_COMM success log event
        addLogEvent(OpenTokConfig.LOG_ACTION_START_COMM, OpenTokConfig.LOG_VARIATION_SUCCESS);
    }

    @Override
    public void onStreamDestroyed(PublisherKit publisherKit, Stream stream) {
        if ( OpenTokConfig.SUBSCRIBE_TO_SELF && mSubscriber != null ) {
            unsubscribeFromStream(stream);
        }
        //restart media status
        mLocalAudio = true;
        mLocalVideo = true;
        mRemoteAudio = true;
        mRemoteVideo = true;

        //add END_COMM success log event
        addLogEvent(OpenTokConfig.LOG_ACTION_END_COMM, OpenTokConfig.LOG_VARIATION_SUCCESS);
    }

    @Override
    public void onError(PublisherKit publisherKit, OpentokError opentokError) {
        Log.i(LOGTAG, "Error publishing: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
        onError(opentokError.getErrorCode() + " - " + opentokError.getMessage());
        restartComm();

        //add START_COMM error log event
        addLogEvent(OpenTokConfig.LOG_ACTION_START_COMM, OpenTokConfig.LOG_VARIATION_ERROR);
    }

    @Override
    public void onConnected(Session session) {
        Log.i(LOGTAG, "Connected to the session.");
        isInitialized = true;

        //Init the analytics logging
        mAnalyticsData = new OTKAnalyticsData.Builder(OpenTokConfig.SESSION_ID, OpenTokConfig.API_KEY, mSession.getConnection().getConnectionId(), OpenTokConfig.LOG_CLIENT_VERSION, OpenTokConfig.LOG_SOURCE).build();
        mAnalytics = new OTKAnalytics(mAnalyticsData);

        //add INITIALIZE attempt log event
        addLogEvent(OpenTokConfig.LOG_ACTION_INITIALIZE, OpenTokConfig.LOG_VARIATION_ATTEMPT);

        onInitialized();

        if ( startPublish ) {
            start();
        }
    }

    @Override
    public void onDisconnected(Session session) {
        Log.i(LOGTAG, "Disconnected to the session.");
        restartViews();
        restartComm();
    }

    @Override
    public void onStreamReceived(Session session, Stream stream) {
        Log.i(LOGTAG, "New remote is connected to the session");
        if ( !OpenTokConfig.SUBSCRIBE_TO_SELF ) {
            mStreams.add(stream);
            if ( mSubscriber == null && isStarted ) {
                subscribeToStream(stream);
            }
        }
    }

    @Override
    public void onStreamDropped(Session session, Stream stream) {
        Log.i(LOGTAG, "Remote left the communication");
        if ( !OpenTokConfig.SUBSCRIBE_TO_SELF ) {
            unsubscribeFromStream(stream);
        }
    }

    @Override
    public void onError(Session session, OpentokError opentokError) {
        Log.i(LOGTAG, "Session error: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
        onError(opentokError.getErrorCode() + " - " + opentokError.getMessage());
        restartComm();

        //add INITIALIZE error log event
        addLogEvent(OpenTokConfig.LOG_ACTION_INITIALIZE, OpenTokConfig.LOG_VARIATION_ERROR );
    }

    @Override
    public void onConnected(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Subscriber connected.");
        if ( !subscriberKit.getStream().hasVideo() ) {
            attachSubscriberView(mSubscriber);
            setRemoteAudioOnly(true);
        }
    }

    @Override
    public void onDisconnected(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Subscriber disconnected.");
    }

    @Override
    public void onError(SubscriberKit subscriberKit, OpentokError opentokError) {
        Log.i(LOGTAG, "Error subscribing: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
        onError(opentokError.getErrorCode() + " - " + opentokError.getMessage());
        restartComm();

    }

    @Override
    public void onVideoDataReceived(SubscriberKit subscriber) {
        Log.i(LOGTAG, "First frame received");
        attachSubscriberView(mSubscriber);
    }

    @Override
    public void onVideoDisabled(SubscriberKit subscriberKit, String reason) {
        Log.i(LOGTAG,
                "Video disabled:" + reason);
        setRemoteAudioOnly(true); //enable audio only status
        if ( reason.equals("quality") ) {  //network quality alert
            onQualityWarning(false);
        }
    }

    @Override
    public void onVideoEnabled(SubscriberKit subscriberKit, String reason) {
        Log.i(LOGTAG, "Video enabled:" + reason);
        //disable audio only status
        setRemoteAudioOnly(false);
    }

    @Override
    public void onVideoDisableWarning(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Video may be disabled soon due to network quality degradation.");
        //network quality warning
        onQualityWarning(true);
    }

    @Override
    public void onVideoDisableWarningLifted(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Video may no longer be disabled as stream quality improved.");
    }

    public AccPackSession getSession() {
        return mSession;
    }

    private void restartViews() {
        if ( mSubscriber != null ) {
            onRemoteViewReady(mSubscriber.getView());
        }
        if ( mPublisher != null ){
            onPreviewReady(null);
        }
    }

    protected void onInitialized() {
        if ( this.mListener != null ) {
            this.mListener.onInitialized();
        }

        //add INITIALIZE success log event
        addLogEvent(OpenTokConfig.LOG_ACTION_INITIALIZE, OpenTokConfig.LOG_VARIATION_SUCCESS);
    }

    protected void onError(String error) {
        if ( this.mListener != null ) {
            this.mListener.onError(error);
        }
    }

    protected void onQualityWarning(boolean warning) {
        if ( this.mListener != null ) {
            this.mListener.onQualityWarning(warning);
        }
    }

    protected void onAudioOnly(boolean enabled) {
        if ( this.mListener != null ) {
            this.mListener.onAudioOnly(enabled);
        }
    }

    protected void onPreviewReady(View preview) {
        if ( this.mListener != null ) {
            this.mListener.onPreviewReady(preview);
        }
    }

    protected void onRemoteViewReady(View remoteView) {
        if ( this.mListener != null ) {
            this.mListener.onRemoteViewReady(remoteView);
        }
    }

    private void addLogEvent(String action, String variation){
        if ( mAnalytics!= null ) {
            mAnalytics.logEvent(action, variation);
        }
    }
}
