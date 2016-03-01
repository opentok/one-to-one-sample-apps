package com.opentok.android.avsample;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.opentok.android.BaseVideoRenderer;
import com.opentok.android.OpentokError;
import com.opentok.android.Publisher;
import com.opentok.android.PublisherKit;
import com.opentok.android.Session;
import com.opentok.android.Stream;
import com.opentok.android.Subscriber;
import com.opentok.android.SubscriberKit;
import com.opentok.android.avsample.config.OpenTokConfig;

import java.util.ArrayList;

public class AVCommunication implements
        Session.SessionListener, Publisher.PublisherListener, Subscriber.SubscriberListener, Subscriber.VideoListener {

    private static final String LOGTAG = "opentok-avcommunication";

    private Context mContext;

    private Session mSession;
    private Publisher mPublisher;
    private Subscriber mSubscriber;
    private ArrayList<Stream> mStreams;

    private ViewGroup mPreviewView;
    private ViewGroup mRemoteView;

    private boolean isStarted = false;
    private boolean mLocalAudio = true;
    private boolean mLocalVideo = true;
    private boolean mRemoteAudio = true;
    private boolean mRemoteVideo = true;

    private boolean isRemote = false;

    /**
     * Defines values for the {@link #enableLocalMedia(MediaType, boolean)}
     * and {@link #enableRemoteMedia(MediaType, boolean)} methods.
     */
    public enum MediaType {
        AUDIO,
        VIDEO
    }

    ;

    public AVCommunication(Context context) {
        this.mContext = context;

        mStreams = new ArrayList<Stream>();
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
                        mPublisher.getView().setBackground(null);

                        if (isRemote) {
                            mPublisher.getView().setBackgroundResource(R.drawable.preview);
                        }
                    } else {
                        mPublisher.getView().setBackgroundResource(R.drawable.avatar);
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
     * Add the view container for the publisher/preview
     */
    public void setPreviewView(ViewGroup previewView) {
        this.mPreviewView = previewView;
    }

    /**
     * Add the view container for the remote view
     */
    public void setRemoteView(ViewGroup remoteView) {
        this.mRemoteView = remoteView;
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

        if (mPublisher != null && mPreviewView != null) {
            mPreviewView.removeView(mPublisher.getView());
            attachPublisherView(!isRemote);
        }
        if (isRemote && mRemoteView != null && mSubscriber != null) {
            mRemoteView.removeView(mSubscriber.getView());
            attachPublisherView(false); //NO FULL SCREEN FOR PREVIEW
            attachSubscriberView(mSubscriber);
        }
    }

    private void subscribeToStream(Stream stream) {
        mSubscriber = new Subscriber(mContext, stream);
        mSubscriber.setVideoListener(this); //TODO IQC Listeners
        mSession.subscribe(mSubscriber);
    }

    private void unsubscriberFromStream(Stream stream) {
        mStreams.remove(stream);
        if (mSubscriber.getStream().equals(stream)) {
            mRemoteView.removeView(mSubscriber.getView());
            mSubscriber = null;
            if (!mStreams.isEmpty()) {
                subscribeToStream(mStreams.get(0));
            }
        }
    }

    private void attachPublisherView(boolean fullScreen) {

        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);

        mPublisher.setStyle(BaseVideoRenderer.STYLE_VIDEO_SCALE,
                BaseVideoRenderer.STYLE_VIDEO_FILL);

        mPreviewView.removeView(mPublisher.getRenderer().getView());

        if (!fullScreen) {
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM,
                    RelativeLayout.TRUE);
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT,
                    RelativeLayout.TRUE);
            layoutParams.width = dpToPx(90);
            layoutParams.height = dpToPx(78);
            layoutParams.rightMargin = dpToPx(24);
            layoutParams.bottomMargin = dpToPx(75);
            mPublisher.getView().setBackgroundResource(R.drawable.preview);
        } else {
            mPublisher.getView().setBackgroundDrawable(null);
        }
        mPreviewView.addView(mPublisher.getView(), layoutParams);
    }

    private void attachSubscriberView(Subscriber subscriber) {
        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                mContext.getResources().getDisplayMetrics().widthPixels, mContext.getResources()
                .getDisplayMetrics().heightPixels);
        mRemoteView.removeView(mSubscriber.getView());
        mRemoteView.addView(mSubscriber.getView(), layoutParams);
        subscriber.setStyle(BaseVideoRenderer.STYLE_VIDEO_SCALE,
                BaseVideoRenderer.STYLE_VIDEO_FILL);
        isRemote = true;
        mRemoteView.setClickable(true);
    }

    private void setRemoteAudioOnly(boolean audioOnly) {
        if (!audioOnly) {
            mSubscriber.getView().setVisibility(View.VISIBLE);
            mRemoteView.getChildAt(1).setVisibility(View.GONE);
        } else {
            mSubscriber.getView().setVisibility(View.GONE);
            mRemoteView.getChildAt(1).setVisibility(View.VISIBLE);
        }
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
            unsubscriberFromStream(stream);
        }
    }

    @Override
    public void onError(PublisherKit publisherKit, OpentokError opentokError) {
        Log.i(LOGTAG, "Error publishing: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
    }

    @Override
    public void onConnected(Session session) {

        Log.i(LOGTAG, "Connected to the session.");
        isStarted = true;

        if (mPublisher == null) {
            mPublisher = new Publisher(mContext, "publisher");
            mPublisher.setPublisherListener(this);
            if (mStreams != null && mStreams.size() >= 1) {
                attachPublisherView(false);
            } else {
                attachPublisherView(true); //preview in full screen
            }
            mSession.publish(mPublisher);
        }

    }

    @Override
    public void onDisconnected(Session session) {
        Log.i(LOGTAG, "Disconnected to the session.");
        isStarted = false;

        if (mPublisher != null) {
            mPreviewView.removeView(mPublisher.getRenderer()
                    .getView());
        }

        if (mSubscriber != null) {
            mRemoteView.removeView(mSubscriber.getRenderer()
                    .getView());
            mRemoteView.setClickable(false);
        }
        mSubscriber = null;
        mPublisher = null;
        mStreams.clear();
        mSession = null;
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
            if (mSubscriber != null
                    && mSubscriber.getStream().getStreamId()
                    .equals(stream.getStreamId())) {
                mRemoteView.removeView(mSubscriber.getView());
                isRemote = false;
                mSubscriber = null;
                if (!mStreams.isEmpty()) {
                    subscribeToStream(mStreams.get(0));
                }
                attachPublisherView(true);
            }
        }
    }

    @Override
    public void onError(Session session, OpentokError opentokError) {
        Log.i(LOGTAG, "Session error: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
    }

    @Override
    public void onConnected(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Subscriber connected.");
    }

    @Override
    public void onDisconnected(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Subscriber disconnected.");
        attachPublisherView(true); //adjust preview view to full screen
    }

    @Override
    public void onError(SubscriberKit subscriberKit, OpentokError opentokError) {
        Log.i(LOGTAG, "Error subscribing: " + opentokError.getErrorCode() + "-" + opentokError.getMessage());
    }

    @Override
    public void onVideoDataReceived(SubscriberKit subscriber) {
        Log.i(LOGTAG, "First frame received");

        attachPublisherView(false); //adjust preview view
        attachSubscriberView(mSubscriber);
    }

    @Override
    public void onVideoDisabled(SubscriberKit subscriberKit, String reason) {
        Log.i(LOGTAG,
                "Video disabled:" + reason);

        setRemoteAudioOnly(true); //show audio only view

        if (reason.equals("quality")) {   //show  quality alert
            final TextView alert = (TextView) mRemoteView.getChildAt(0);
            alert.setVisibility(View.VISIBLE);
            alert.setBackgroundResource(R.color.quality_alert);
            alert.setTextColor(mContext.getResources().getColor(R.color.white));

            alert.postDelayed(new Runnable() {
                public void run() {
                    alert.setVisibility(View.GONE);
                }
            }, 7000);
        }
    }

    @Override
    public void onVideoEnabled(SubscriberKit subscriberKit, String reason) {
        Log.i(LOGTAG, "Video enabled:" + reason);

        setRemoteAudioOnly(false); //hide audio only view

        if (reason.equals("quality")) {   //hide  quality alert
            mRemoteView.getChildAt(0).setVisibility(View.GONE);
        }
    }

    @Override
    public void onVideoDisableWarning(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Video may be disabled soon due to network quality degradation.");

        //show quality warning
        final TextView alert = (TextView) mRemoteView.getChildAt(0);
        alert.setBackgroundResource(R.color.quality_warning);
        alert.setTextColor(mContext.getResources().getColor(R.color.warning_text));

        alert.setVisibility(View.VISIBLE);
        alert.postDelayed(new Runnable() {
            public void run() {
                alert.setVisibility(View.GONE);
            }
        }, 7000);
    }

    @Override
    public void onVideoDisableWarningLifted(SubscriberKit subscriberKit) {
        Log.i(LOGTAG, "Video may no longer be disabled as stream quality improved.");

        //hide quality warning
        mRemoteView.getChildAt(0).setVisibility(View.GONE);
    }

    /**
     * Converts dp to real pixels, according to the screen density.
     *
     * @param dp A number of density-independent pixels.
     * @return The equivalent number of real pixels.
     */
    private int dpToPx(int dp) {
        double screenDensity = mContext.getResources().getDisplayMetrics().density;
        return (int) (screenDensity * (double) dp);
    }
}
