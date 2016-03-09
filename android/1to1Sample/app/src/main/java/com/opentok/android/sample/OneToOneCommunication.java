package com.opentok.android.sample;

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
import com.opentok.android.sample.R;
import com.opentok.android.sample.config.OpenTokConfig;
import com.opentok.android.sample.logging.OTKAnalytics;
import com.opentok.android.sample.logging.OTKAnalyticsData;

import java.util.ArrayList;

public class OneToOneCommunication implements
        Session.SessionListener, Publisher.PublisherListener, Subscriber.SubscriberListener, Subscriber.VideoListener {

    private static final String LOGTAG = "opentok-1to1-comm";
    private Context mContext;

    private Session mSession;
    private Publisher mPublisher;
    private Subscriber mSubscriber;
    private ArrayList<Stream> mStreams;

    private boolean isStarted = false;
    private boolean mLocalAudio = true;
    private boolean mLocalVideo = true;
    private boolean mRemoteAudio = true;
    private boolean mRemoteVideo = true;

    private boolean isRemote = false;

    protected Listener mListener;
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
     *
     */
    public static interface Listener {
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
         *          or the video remote control has disabled.
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

    /**
     * Start the communication.
     */
    public void start() {
        if (mSession == null) {
            mSession = new Session(mContext,
                    OpenTokConfig.API_KEY, OpenTokConfig.SESSION_ID);
            mSession.setSessionListener(this);
            mSession.connect(OpenTokConfig.TOKEN);
        }
    }

    /**
     * End the communication.
     */
    public void end() {
        if (mSession != null) {
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
        if (mPublisher != null) {
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
        if (mSubscriber != null) {
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
        if (mPublisher != null) {
            mPublisher.swapCamera();
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
        if (mPublisher != null) {
            attachPublisherView();
        }
        if (isRemote && mSubscriber != null) {
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
        mStreams.remove(stream);
        isRemote = false;
        if (mSubscriber.getStream().equals(stream)) {
            mSubscriber = null;
            if (!mStreams.isEmpty()) {
                subscribeToStream(mStreams.get(0));
            }
        }
        mListener.onRemoteViewReady(null);
    }

    private void attachPublisherView() {
        mPublisher.setStyle(BaseVideoRenderer.STYLE_VIDEO_SCALE,
                BaseVideoRenderer.STYLE_VIDEO_FILL);
        mListener.onPreviewReady(mPublisher.getView());
    }

    private void attachSubscriberView(Subscriber subscriber) {
        subscriber.setStyle(BaseVideoRenderer.STYLE_VIDEO_SCALE,
                BaseVideoRenderer.STYLE_VIDEO_FILL);
        isRemote = true;
        mListener.onRemoteViewReady(subscriber.getView());
    }

    private void setRemoteAudioOnly(boolean audioOnly) {
        if (!audioOnly) {
            mSubscriber.getView().setVisibility(View.VISIBLE);
            mListener.onAudioOnly(false);
        } else {
            mSubscriber.getView().setVisibility(View.GONE);
            mListener.onAudioOnly(true);
        }
    }

    private void restartComm(){
        mSubscriber = null;
        isRemote = false;
        mPublisher = null;
        mStreams.clear();
        mSession = null;
    }

    private void addLogEvent(String connectionId){
        String sessionID = OpenTokConfig.SESSION_ID;
        String partnerId = OpenTokConfig.API_KEY;

        OTKAnalyticsData data = new OTKAnalyticsData.Builder(sessionID, partnerId, connectionId, OpenTokConfig.LOG_CLIENT_VERSION).build();
        OTKAnalytics logging = new OTKAnalytics(data);

        logging.logEvent(OpenTokConfig.LOG_ACTION, OpenTokConfig.LOG_VARIATION);
    }

    @Override
    public void onStreamCreated(PublisherKit publisherKit, Stream stream) {
        if (OpenTokConfig.SUBSCRIBE_TO_SELF) {
            mStreams.add(stream);
            if (mSubscriber == null) {
                subscribeToStream(stream);
            }
        }
    }

    @Override
    public void onStreamDestroyed(PublisherKit publisherKit, Stream stream) {
        if (OpenTokConfig.SUBSCRIBE_TO_SELF && mSubscriber != null) {
            unsubscribeFromStream(stream);
        }
    }

    @Override
    public void onError(PublisherKit publisherKit, OpentokError opentokError) {
        Log.i(LOGTAG, "Error publishing: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
        mListener.onError(opentokError.getErrorCode() + " - " + opentokError.getMessage());
        restartComm();
    }

    @Override
    public void onConnected(Session session) {
        Log.i(LOGTAG, "Connected to the session.");
        isStarted = true;

        //add analytics log
        addLogEvent(session.getConnection().getConnectionId());

        if (mPublisher == null) {
            mPublisher = new Publisher(mContext, "myPublisher");
            mPublisher.setPublisherListener(this);
            attachPublisherView();
            mSession.publish(mPublisher);
        }

    }

    @Override
    public void onDisconnected(Session session) {
        Log.i(LOGTAG, "Disconnected to the session.");
        isStarted = false;
        mListener.onPreviewReady(null);
        mListener.onRemoteViewReady(null);
        restartComm();
    }

    @Override
    public void onStreamReceived(Session session, Stream stream) {
        Log.i(LOGTAG, "New remote is connected to the session");
        if (!OpenTokConfig.SUBSCRIBE_TO_SELF) {
            mStreams.add(stream);
            if (mSubscriber == null) {
                subscribeToStream(stream);
            }
        }
    }

    @Override
    public void onStreamDropped(Session session, Stream stream) {
        Log.i(LOGTAG, "Remote left the communication");
        mStreams.remove(stream);
        if (!OpenTokConfig.SUBSCRIBE_TO_SELF) {
            unsubscribeFromStream(stream);
        }
    }

    @Override
    public void onError(Session session, OpentokError opentokError) {
        Log.i(LOGTAG, "Session error: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
        mListener.onError(opentokError.getErrorCode() + " - " + opentokError.getMessage());
        restartComm();
    }

    @Override
    public void onConnected(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Subscriber connected." + subscriberKit.getSubscribeToVideo());
    }

    @Override
    public void onDisconnected(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Subscriber disconnected.");
    }

    @Override
    public void onError(SubscriberKit subscriberKit, OpentokError opentokError) {
        Log.i(LOGTAG, "Error subscribing: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
        mListener.onError(opentokError.getErrorCode() + " - " + opentokError.getMessage());
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
        if (reason.equals("quality")) {  //network quality alert
            mListener.onQualityWarning(false);
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
        mListener.onQualityWarning(true);
    }

    @Override
    public void onVideoDisableWarningLifted(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Video may no longer be disabled as stream quality improved.");
    }
}
