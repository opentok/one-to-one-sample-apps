package com.tokbox.android.textchatsample.ui;

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

import com.tokbox.android.otsdkwrapper.utils.MediaType;
import com.tokbox.android.textchatsample.MainActivity;
import com.tokbox.android.textchatsample.R;

public class RemoteControlFragment extends Fragment {

    private static final String LOGTAG = RemoteControlFragment.class.getSimpleName();
    private static final int ANIMATION_DURATION = 7000;

    private MainActivity mActivity;

    private RelativeLayout mContainer;
    private View mRootView;
    private ImageButton mAudioBtn;
    private ImageButton mVideoBtn;

    private RemoteControlCallbacks mControlCallbacks = remoteCallbacks;

    private String mRemoteId;

    public interface RemoteControlCallbacks {
        public void onDisableRemoteAudio(boolean audio);

        public void onDisableRemoteVideo(boolean video);
    }

    private static RemoteControlCallbacks remoteCallbacks = new RemoteControlCallbacks() {
        @Override
        public void onDisableRemoteAudio(boolean audio) { }

        @Override
        public void onDisableRemoteVideo(boolean video) { }
    };

    private View.OnClickListener mBtnClickListener = new View.OnClickListener() {
        public void onClick(View v) {
            switch (v.getId()) {
                case R.id.remoteAudio:
                    updateRemoteAudio();
                    break;

                case R.id.remoteVideo:
                    updateRemoteVideo();
                    break;
            }
        }
    };

    @Override
    public void onAttach(Context context) {
        Log.i(LOGTAG, "OnAttach RemoteControlFragment");

        super.onAttach(context);

        this.mActivity = (MainActivity) context;
        this.mControlCallbacks = (RemoteControlCallbacks) context;
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            this.mActivity = (MainActivity) activity;
            this.mControlCallbacks = (RemoteControlCallbacks) activity;
        }

        if ( mRemoteId == null ) {
            mRemoteId = getArguments().getString("remoteId");
        }

    }

    @Override
    public void onDetach() {
        Log.i(LOGTAG, "OnDetach RemoteControlFragment");

        super.onDetach();

        mControlCallbacks = remoteCallbacks;
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        Log.i(LOGTAG, "OnCreate RemoteControlFragment");

        mRootView = inflater.inflate(R.layout.remote_actionbar_fragment, container, false);

        mContainer = (RelativeLayout) this.mActivity.findViewById(R.id.actionbar_remote_fragment_container);
        mAudioBtn = (ImageButton) mRootView.findViewById(R.id.remoteAudio);
        mVideoBtn = (ImageButton) mRootView.findViewById(R.id.remoteVideo);

        mAudioBtn.setOnClickListener(mBtnClickListener);
        mVideoBtn.setOnClickListener(mBtnClickListener);

        return mRootView;
    }

    public void updateRemoteAudio(){
        if(mRemoteId != null && !mActivity.getWrapper().isReceivedMediaEnabled(mRemoteId, MediaType.AUDIO)){
            mControlCallbacks.onDisableRemoteAudio(true);
            mAudioBtn.setImageResource(R.drawable.audio);
        }
        else {
            mControlCallbacks.onDisableRemoteAudio(false);
            mAudioBtn.setImageResource(R.drawable.no_audio);
        }
    }

    public void updateRemoteVideo(){
        if(mRemoteId != null && !mActivity.getWrapper().isReceivedMediaEnabled(mRemoteId, MediaType.VIDEO)){
            mControlCallbacks.onDisableRemoteVideo(true);
            mVideoBtn.setImageResource(R.drawable.video_icon);
        }
        else {
            mControlCallbacks.onDisableRemoteVideo(false);
            mVideoBtn.setImageResource(R.drawable.no_video_icon);
        }
    }

    public void show(){
        mContainer.setVisibility(View.VISIBLE);
        mRootView.setVisibility(View.VISIBLE);

        mContainer.postDelayed(new Runnable() {
            public void run() {
                mContainer.setVisibility(View.INVISIBLE);
            }
        }, ANIMATION_DURATION);
    }

    private void setEnabled(boolean enabled) {
        if (mVideoBtn != null && mAudioBtn != null) {
            if (!enabled) {
                mAudioBtn.setImageResource(R.drawable.audio);
                mVideoBtn.setImageResource(R.drawable.video_icon);
            }
        }
    }

    public void restart() {
        setEnabled(false);
        mContainer.setVisibility(View.INVISIBLE);
    }

}