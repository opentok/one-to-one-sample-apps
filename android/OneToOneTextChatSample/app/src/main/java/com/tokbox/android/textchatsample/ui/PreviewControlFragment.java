package com.tokbox.android.textchatsample.ui;

import android.app.Activity;
import android.graphics.Color;
import android.support.graphics.drawable.VectorDrawableCompat;
import android.support.v4.app.Fragment;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.RelativeLayout;

import com.tokbox.android.otsdkwrapper.utils.MediaType;
import com.tokbox.android.textchatsample.MainActivity;
import com.tokbox.android.textchatsample.R;


public class PreviewControlFragment extends Fragment {

    private static final String LOGTAG = MainActivity.class.getName();

    private MainActivity mActivity;
    View rootView;

    private ImageButton mAudioBtn;
    private ImageButton mVideoBtn;
    private ImageButton mCallBtn;
    private ImageButton mTextChatBtn;
    private ImageButton mUnreadMessages;
    VectorDrawableCompat drawableStartCall;
    VectorDrawableCompat drawableEndCall;
    VectorDrawableCompat drawableBckBtn;

    private PreviewControlCallbacks mControlCallbacks = previewCallbacks;

    public interface PreviewControlCallbacks {

        public void onDisableLocalAudio(boolean audio);

        public void onDisableLocalVideo(boolean video);

        public void onCall();

        public void onTextChat();

    }

    private static PreviewControlCallbacks previewCallbacks = new PreviewControlCallbacks() {
        @Override
        public void onDisableLocalAudio(boolean audio) { }

        @Override
        public void onDisableLocalVideo(boolean video) { }

        @Override
        public void onCall() { }

        @Override
        public void onTextChat() { }

    };

    private View.OnClickListener mBtnClickListener = new View.OnClickListener() {
        public void onClick(View v) {
            switch (v.getId()) {
                case R.id.localAudio:
                    updateLocalAudio();
                    break;

                case R.id.localVideo:
                    updateLocalVideo();
                    break;

                case R.id.call:
                    updateCall();
                    break;

                case R.id.textChat:
                    updateTextChat();
                    break;
            }
        }
    };

    @Override
    public void onAttach(Context context) {
        Log.i(LOGTAG, "OnAttach PreviewControlFragment");

        super.onAttach(context);

        this.mActivity = (MainActivity) context;
        this.mControlCallbacks = (PreviewControlCallbacks) context;
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {

            this.mActivity = (MainActivity) activity;
            this.mControlCallbacks = (PreviewControlCallbacks) activity;
        }
    }

    @Override
    public void onDetach() {
        Log.i(LOGTAG, "onDetach PreviewControlFragment");

        super.onDetach();

        mControlCallbacks = previewCallbacks;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Retain this fragment across configuration changes.
        setRetainInstance(true);
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        Log.i(LOGTAG, "OnCreate PreviewControlFragment");

        rootView = inflater.inflate(R.layout.preview_actionbar_fragment, container, false);
        mAudioBtn = (ImageButton) rootView.findViewById(R.id.localAudio);
        mVideoBtn = (ImageButton) rootView.findViewById(R.id.localVideo);
        mCallBtn = (ImageButton) rootView.findViewById(R.id.call);
        mTextChatBtn = (ImageButton) rootView.findViewById(R.id.textChat);
        mUnreadMessages = (ImageButton) rootView.findViewById(R.id.unread_messages);

        drawableStartCall = VectorDrawableCompat.create(getResources(), R.drawable.initiate_call_button, null);
        drawableEndCall = VectorDrawableCompat.create(getResources(), R.drawable.end_call_button, null);
        drawableBckBtn = VectorDrawableCompat.create(getResources(), R.drawable.bckg_icon, null);

        mTextChatBtn.setBackground(drawableBckBtn);

        mAudioBtn.setImageResource(mActivity.getWrapper().isLocalMediaEnabled(MediaType.AUDIO)
                ? R.drawable.mic_icon
                : R.drawable.muted_mic_icon);
        mAudioBtn.setBackground(drawableBckBtn);

        mVideoBtn.setImageResource(mActivity.getWrapper().isLocalMediaEnabled(MediaType.VIDEO)
                ? R.drawable.video_icon
                : R.drawable.no_video_icon);
        mVideoBtn.setBackground(drawableBckBtn);

        mCallBtn.setImageResource(mActivity.isCallInProgress()
                ? R.drawable.hang_up
                : R.drawable.start_call);

        mCallBtn.setBackground(mActivity.isCallInProgress()
                ? drawableEndCall
                : drawableStartCall);

        mCallBtn.setOnClickListener(mBtnClickListener);

        setEnabled(mActivity.isCallInProgress());

        return rootView;
    }

    public void updateLocalAudio() {
        if (!mActivity.getWrapper().isLocalMediaEnabled(MediaType.AUDIO)) {
            mControlCallbacks.onDisableLocalAudio(true);
            mAudioBtn.setImageResource(R.drawable.mic_icon);
        } else {
            mControlCallbacks.onDisableLocalAudio(false);
            mAudioBtn.setImageResource(R.drawable.muted_mic_icon);
        }
    }

    public void updateLocalVideo() {
        if (!mActivity.getWrapper().isLocalMediaEnabled(MediaType.VIDEO)){
            mControlCallbacks.onDisableLocalVideo(true);
            mVideoBtn.setImageResource(R.drawable.video_icon);
        } else {
            mControlCallbacks.onDisableLocalVideo(false);
            mVideoBtn.setImageResource(R.drawable.no_video_icon);
        }
    }

    public void updateCall() {
        mCallBtn.setImageResource(!mActivity.isCallInProgress()
                ? R.drawable.hang_up
                : R.drawable.start_call);

        mCallBtn.setBackground(!mActivity.isCallInProgress()
                ? drawableEndCall
                : drawableStartCall);

        if ( mControlCallbacks != null )
            mControlCallbacks.onCall();
    }

    public void setEnabled(boolean enabled) {
        if (mVideoBtn != null && mAudioBtn != null) {
            if (enabled) {
                mAudioBtn.setOnClickListener(mBtnClickListener);
                mVideoBtn.setOnClickListener(mBtnClickListener);
                mTextChatBtn.setOnClickListener(mBtnClickListener);
            } else {
                mAudioBtn.setOnClickListener(null);
                mVideoBtn.setOnClickListener(null);
                mAudioBtn.setImageResource(R.drawable.mic_icon);
                mVideoBtn.setImageResource(R.drawable.video_icon);
                mTextChatBtn.setOnClickListener(null);
            }
        }
    }

    public void updateTextChat() {
        mControlCallbacks.onTextChat();
    }
    public void unreadMessages(final boolean unread) {
        getActivity().runOnUiThread( new Runnable() {
            @Override
            public void run() {
                if (unread) {
                    mUnreadMessages.setVisibility(View.VISIBLE);
                }
                else {
                    mUnreadMessages.setVisibility(View.GONE);
                }
            }
        });
    }
    public void restart() {
        setEnabled(false);

        mCallBtn.setBackground(drawableStartCall);
        mCallBtn.setImageResource(R.drawable.start_call);

    }
}