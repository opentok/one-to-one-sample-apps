package com.opentok.android.sample.ui;

import android.app.Activity;
import android.app.Fragment;
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

import com.opentok.android.sample.MainActivity;
import com.opentok.android.avsample.R;


public class PreviewControlFragment extends Fragment {

    private static final String LOGTAG = "local-control-fragment";

    private MainActivity mActivity;

    private RelativeLayout mContainer;
    View rootView;

    private ImageButton mAudioBtn;
    private ImageButton mVideoBtn;
    private ImageButton mCallBtn;

    private PreviewControlCallbacks mControlCallbacks = previewCallbacks;

    public interface PreviewControlCallbacks {

        public void onMuteLocalAudio(boolean audio);

        public void onMuteLocalVideo(boolean video);

        public void onCall();

    }

    private static PreviewControlCallbacks previewCallbacks = new PreviewControlCallbacks() {
        @Override
        public void onMuteLocalAudio(boolean audio) { }

        @Override
        public void onMuteLocalVideo(boolean video) { }

        @Override
        public void onCall() { }
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

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        Log.i(LOGTAG, "OnCreate PreviewControlFragment");

        rootView = inflater.inflate(R.layout.preview_actionbar_fragment, container, false);

        mContainer = (RelativeLayout) this.mActivity.findViewById(R.id.actionbar_preview_fragment_container);
        mAudioBtn = (ImageButton) rootView.findViewById(R.id.localAudio);
        mVideoBtn = (ImageButton) rootView.findViewById(R.id.localVideo);
        mCallBtn = (ImageButton) rootView.findViewById(R.id.call);


        mAudioBtn.setImageResource(mActivity.getComm().getLocalAudio()
                ? R.drawable.mic_icon
                : R.drawable.muted_mic_icon);

        mVideoBtn.setImageResource(mActivity.getComm().getLocalVideo()
                ? R.drawable.video_icon
                : R.drawable.no_video_icon);


        mCallBtn.setImageResource(mActivity.getComm().isStarted()
                ? R.drawable.hang_up
                : R.drawable.start_call);

        mCallBtn.setBackgroundResource(mActivity.getComm().isStarted()
                ? R.drawable.end_call_button
                : R.drawable.initiate_call_button);

        mCallBtn.setOnClickListener(mBtnClickListener);
        setEnabled(mActivity.getComm().isStarted());

        return rootView;

    }

    public void updateLocalAudio() {
        if (!mActivity.getComm().getLocalAudio()) {
            mControlCallbacks.onMuteLocalAudio(true);
            mAudioBtn.setImageResource(R.drawable.mic_icon);
        } else {
            mControlCallbacks.onMuteLocalAudio(false);
            mAudioBtn.setImageResource(R.drawable.muted_mic_icon);
        }
    }

    public void updateLocalVideo() {
        if (!mActivity.getComm().getLocalVideo()) {
            mControlCallbacks.onMuteLocalVideo(true);
            mVideoBtn.setImageResource(R.drawable.video_icon);
        } else {
            mControlCallbacks.onMuteLocalVideo(false);
            mVideoBtn.setImageResource(R.drawable.no_video_icon);
        }
    }

    public void updateCall() {
        mCallBtn.setImageResource(!mActivity.getComm().isStarted()
                ? R.drawable.hang_up
                : R.drawable.start_call);

        mCallBtn.setBackgroundResource(!mActivity.getComm().isStarted()
                ? R.drawable.end_call_button
                : R.drawable.initiate_call_button);

        mControlCallbacks.onCall();
    }

    public void setEnabled(boolean enabled) {
        if (mVideoBtn != null && mAudioBtn != null) {
            if (enabled) {
                mAudioBtn.setOnClickListener(mBtnClickListener);
                mVideoBtn.setOnClickListener(mBtnClickListener);
            } else {
                mAudioBtn.setOnClickListener(null);
                mVideoBtn.setOnClickListener(null);
                mAudioBtn.setImageResource(R.drawable.mic_icon);
                mVideoBtn.setImageResource(R.drawable.video_icon);
            }
        }
    }

    public void restartFragment(boolean restart){
        if ( restart ) {
            setEnabled(false);
            mCallBtn.setBackgroundResource(R.drawable.initiate_call_button);
            mCallBtn.setImageResource(R.drawable.start_call);
        }
    }
}
