package com.tokbox.android.screensharingsample.ui;

import android.app.Activity;
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

import com.tokbox.android.screensharingsample.MainActivity;
import com.tokbox.android.screensharingsample.R;


public class PreviewControlFragment extends Fragment {

    private static final String LOGTAG = MainActivity.class.getName();

    private MainActivity mActivity;

    private RelativeLayout mContainer;
    View rootView;

    private ImageButton mAudioBtn;
    private ImageButton mVideoBtn;
    private ImageButton mCallBtn;
    private ImageButton mScreenSharingBtn;
    private ImageButton mAnnotationsBtn;

    private PreviewControlCallbacks mControlCallbacks = previewCallbacks;

    public interface PreviewControlCallbacks {

        public void onDisableLocalAudio(boolean audio);

        public void onDisableLocalVideo(boolean video);

        public void onCall();

        public void onScreenSharing();

        public void onAnnotations();

    }

    private static PreviewControlCallbacks previewCallbacks = new PreviewControlCallbacks() {
        @Override
        public void onDisableLocalAudio(boolean audio) { }

        @Override
        public void onDisableLocalVideo(boolean video) { }

        @Override
        public void onCall() { }

        @Override
        public void onScreenSharing() { }

        @Override
        public void onAnnotations() { }

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

                case R.id.screenSharing:
                    updateScreensharing();
                    break;

                case R.id.annotations:
                    updateAnnotations();
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
        mScreenSharingBtn = (ImageButton) rootView.findViewById(R.id.screenSharing);
        mAnnotationsBtn = (ImageButton) rootView.findViewById(R.id.annotations);

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

    private void updateLocalAudio() {
        if (!mActivity.getComm().getLocalAudio()) {
            mControlCallbacks.onDisableLocalAudio(true);
            mAudioBtn.setImageResource(R.drawable.mic_icon);
        } else {
            mControlCallbacks.onDisableLocalAudio(false);
            mAudioBtn.setImageResource(R.drawable.muted_mic_icon);
        }
    }

    private void updateLocalVideo() {
        if (!mActivity.getComm().getLocalVideo()) {
            mControlCallbacks.onDisableLocalVideo(true);
            mVideoBtn.setImageResource(R.drawable.video_icon);
        } else {
            mControlCallbacks.onDisableLocalVideo(false);
            mVideoBtn.setImageResource(R.drawable.no_video_icon);
        }
    }

    private void updateCall() {
        mCallBtn.setImageResource(!mActivity.getComm().isStarted()
                ? R.drawable.hang_up
                : R.drawable.start_call);
        mCallBtn.setBackgroundResource(!mActivity.getComm().isStarted()
                ? R.drawable.end_call_button
                : R.drawable.initiate_call_button);
        mControlCallbacks.onCall();
    }

    private void updateScreensharing() {
        mVideoBtn.setOnClickListener(!mActivity.isScreensharing()
                ? null
                : mBtnClickListener);

        mAnnotationsBtn.setOnClickListener(!mActivity.isScreensharing()
                ? mBtnClickListener
                : null);

        mScreenSharingBtn.setBackgroundResource(!mActivity.isScreensharing()
                ? R.drawable.bckg_icon_selected
                : R.drawable.bckg_icon);

        mControlCallbacks.onScreenSharing();
    }

    private void updateAnnotations() {
        restartAnnotations();
        mControlCallbacks.onAnnotations();
    }

    public void setEnabled(boolean enabled) {
        if (mVideoBtn != null && mAudioBtn != null) {
            if (enabled) {
                mAudioBtn.setOnClickListener(mBtnClickListener);
                mVideoBtn.setOnClickListener(mBtnClickListener);
                mScreenSharingBtn.setOnClickListener(mBtnClickListener);
                if ( mActivity.getComm().getRemoteScreenView() != null ){
                    enableAnnotations(true);
                }
            } else {
                mAudioBtn.setOnClickListener(null);
                mVideoBtn.setOnClickListener(null);
                mAudioBtn.setImageResource(R.drawable.mic_icon);
                mVideoBtn.setImageResource(R.drawable.video_icon);
                mScreenSharingBtn.setOnClickListener(null);
                mAnnotationsBtn.setOnClickListener(null);

            }
        }
    }

    public void restart() {
        setEnabled(false);
        mCallBtn.setBackgroundResource(R.drawable.initiate_call_button);
        mCallBtn.setImageResource(R.drawable.start_call);
        mScreenSharingBtn.setBackgroundResource(R.drawable.bckg_icon);
        mAnnotationsBtn.setBackgroundResource(R.drawable.bckg_icon);
    }

    public void restartAnnotations(){
        mAnnotationsBtn.setBackgroundResource(R.drawable.bckg_icon);
        enableAnnotations(false);
    }
    public void enableAnnotations(boolean enable){

        if (mAnnotationsBtn != null ) {
            mAnnotationsBtn.setOnClickListener(enable
                    ? mBtnClickListener
                    : null);
        }
    }
    public void restartScreensharing(){
        mScreenSharingBtn.setBackgroundResource(R.drawable.bckg_icon);
    }
}
