package com.opentok.android.sample;

import android.Manifest;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.drawable.BitmapDrawable;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.opentok.android.sample.R;
import com.opentok.android.sample.ui.PreviewCameraFragment;
import com.opentok.android.sample.ui.PreviewControlFragment;
import com.opentok.android.sample.ui.RemoteControlFragment;


public class MainActivity extends AppCompatActivity implements OneToOneCommunication.Listener, PreviewControlFragment.PreviewControlCallbacks, RemoteControlFragment.RemoteControlCallbacks, PreviewCameraFragment.PreviewCameraCallbacks {
    private final String LOGTAG = "opentok-1to1-sample";

    private final String[] permissions = {Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA};
    private final int permsRequestCode = 200;

    //OpenTok calls
    private OneToOneCommunication mComm;

    private RelativeLayout mPreviewViewContainer;
    private RelativeLayout mRemoteViewContainer;
    private RelativeLayout mAudioOnlyView;
    private RelativeLayout mLocalAudioOnlyView;
    private RelativeLayout.LayoutParams layoutParamsPreview;
    private TextView mAlert;
    private ImageView mAudioOnlyImage;

    //UI fragments
    private PreviewControlFragment mPreviewFragment;
    private RemoteControlFragment mRemoteFragment;
    private PreviewCameraFragment mCameraFragment;
    private FragmentTransaction mFragmentTransaction;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.i(LOGTAG, "onCreate");
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        mPreviewViewContainer = (RelativeLayout) findViewById(R.id.publisherview);
        mRemoteViewContainer = (RelativeLayout) findViewById(R.id.subscriberview);
        mAlert = (TextView) findViewById(R.id.quality_warning);
        mAudioOnlyView = (RelativeLayout) findViewById(R.id.audioOnlyView);
        mLocalAudioOnlyView = (RelativeLayout) findViewById(R.id.localAudioOnlyView);

        //request Marshmallow camera permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(permissions, permsRequestCode);
        }

        //init 1to1 communication object
        mComm = new OneToOneCommunication(MainActivity.this);
        //set listener to receive the communication events, and add UI to these events
        mComm.setListener(this);

        //init controls fragments
        if (savedInstanceState == null) {
            mFragmentTransaction = getSupportFragmentManager().beginTransaction();
            initCameraFragment(); //to swap camera
            initPreviewFragment(); //to enable/disable local media
            initRemoteFragment(); //to enable/disable remote media
            mFragmentTransaction.commitAllowingStateLoss();
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        if (mCameraFragment != null) {
            getSupportFragmentManager().beginTransaction()
                    .remove(mCameraFragment).commit();
            initCameraFragment();
        }

        if (mPreviewFragment != null) {
            getSupportFragmentManager().beginTransaction()
                    .remove(mPreviewFragment).commit();
            initPreviewFragment();
        }

        if (mRemoteFragment != null) {
            getSupportFragmentManager().beginTransaction()
                    .remove(mRemoteFragment).commit();
            initRemoteFragment();
        }

        if (mComm != null) {
            mComm.reloadViews(); //reload the local preview and the remote views
        }

    }

    @Override
    public void onRequestPermissionsResult(int permsRequestCode, String[] permissions,
                                           int[] grantResults) {
        switch (permsRequestCode) {

            case 200:
                boolean video = grantResults[0] == PackageManager.PERMISSION_GRANTED;
                boolean audio = grantResults[1] == PackageManager.PERMISSION_GRANTED;
                break;
        }
    }

    private void initPreviewFragment() {
        mPreviewFragment = new PreviewControlFragment();
        getSupportFragmentManager().beginTransaction()
                .add(R.id.actionbar_preview_fragment_container, mPreviewFragment).commit();
    }

    private void initRemoteFragment() {
        mRemoteFragment = new RemoteControlFragment();
        getSupportFragmentManager().beginTransaction()
                .add(R.id.actionbar_remote_fragment_container, mRemoteFragment).commit();
    }

    private void initCameraFragment() {
        mCameraFragment = new PreviewCameraFragment();
        getSupportFragmentManager().beginTransaction()
                .add(R.id.camera_preview_fragment_container, mCameraFragment).commit();
    }

    public OneToOneCommunication getComm() {
        return mComm;
    }

    //Local control callbacks
    @Override
    public void onDisableLocalAudio(boolean audio) {
        if (mComm != null) {
            mComm.enableLocalMedia(OneToOneCommunication.MediaType.AUDIO, audio);
        }
    }

    @Override
    public void onDisableLocalVideo(boolean video) {
        if (mComm != null) {
            mComm.enableLocalMedia(OneToOneCommunication.MediaType.VIDEO, video);

            if (mComm.isRemote()) {
                if (!video) {
                    mAudioOnlyImage = new ImageView(this);
                    mAudioOnlyImage.setImageResource(R.drawable.avatar);
                    mAudioOnlyImage.setBackgroundResource(R.drawable.bckg_audio_only);
                    mPreviewViewContainer.addView(mAudioOnlyImage);
                } else {
                    mPreviewViewContainer.removeView(mAudioOnlyImage);
                }
            } else {
                if (!video) {
                    mLocalAudioOnlyView.setVisibility(View.VISIBLE);
                    mPreviewViewContainer.addView(mLocalAudioOnlyView);
                } else {
                    mLocalAudioOnlyView.setVisibility(View.GONE);
                    mPreviewViewContainer.removeView(mLocalAudioOnlyView);
                }
            }
        }
    }

    @Override
    public void onCall() {
        if (mComm != null && mComm.isStarted()) {
            mComm.end();
            cleanViewsAndControls();
        } else {
            mComm.start();
            if (mPreviewFragment != null) {
                mPreviewFragment.setEnabled(true);
            }
        }
    }

    //Remote control callbacks
    @Override
    public void onDisableRemoteAudio(boolean audio) {
        if (mComm != null) {
            mComm.enableRemoteMedia(OneToOneCommunication.MediaType.AUDIO, audio);
        }
    }

    @Override
    public void onDisableRemoteVideo(boolean video) {
        if (mComm != null) {
            mComm.enableRemoteMedia(OneToOneCommunication.MediaType.VIDEO, video);
        }
    }

    public void showRemoteControlBar(View v) {
        if (mRemoteFragment != null && mComm.isRemote()) {
            mRemoteFragment.show();
        }
    }

    //Camera control callback
    @Override
    public void onCameraSwap() {
        if (mComm != null) {
            mComm.swapCamera();
        }
    }

    //cleans views and controls
    private void cleanViewsAndControls() {
        mPreviewFragment.restartFragment(true);
    }

    //OneToOneCommunication callbacks
    @Override
    public void onError(String error) {
        Toast.makeText(this, error, Toast.LENGTH_LONG).show();
        mComm.end(); //end communication
        cleanViewsAndControls(); //restart views
    }

    @Override
    public void onQualityWarning(boolean warning) {
        if (warning) { //quality warning
            mAlert.setBackgroundResource(R.color.quality_warning);
            mAlert.setTextColor(this.getResources().getColor(R.color.warning_text));
        } else { //quality alert
            mAlert.setBackgroundResource(R.color.quality_alert);
            mAlert.setTextColor(this.getResources().getColor(R.color.white));
        }
        mAlert.bringToFront();
        mAlert.setVisibility(View.VISIBLE);
        mAlert.postDelayed(new Runnable() {
            public void run() {
                mAlert.setVisibility(View.GONE);
            }
        }, 7000);
    }

    @Override
    public void onAudioOnly(boolean enabled) {
        if (enabled) {
            mAudioOnlyView.setVisibility(View.VISIBLE);
        }
        else {
            mAudioOnlyView.setVisibility(View.GONE);
        }
    }

    @Override
    public void onPreviewReady(View preview) {
        mPreviewViewContainer.removeAllViews();
        if (preview != null) {
            layoutParamsPreview = new RelativeLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);

            if (mComm.isRemote()) {
                layoutParamsPreview.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM,
                        RelativeLayout.TRUE);
                layoutParamsPreview.addRule(RelativeLayout.ALIGN_PARENT_RIGHT,
                        RelativeLayout.TRUE);
                layoutParamsPreview.width = (int) getResources().getDimension(R.dimen.preview_width);
                layoutParamsPreview.height = (int) getResources().getDimension(R.dimen.preview_height);
                layoutParamsPreview.rightMargin = (int) getResources().getDimension(R.dimen.preview_rightMargin);
                layoutParamsPreview.bottomMargin = (int) getResources().getDimension(R.dimen.preview_bottomMargin);
                preview.setBackgroundResource(R.drawable.preview);
            } else {
                preview.setBackground(null);
            }
            mPreviewViewContainer.setLayoutParams(layoutParamsPreview);
            mPreviewViewContainer.addView(preview);
        }
    }

    @Override
    public void onRemoteViewReady(View remoteView) {
        //update preview when a new participant joined to the communication
        onPreviewReady(mPreviewViewContainer.getChildAt(0)); //main preview view
        if (remoteView == null ){
            mRemoteViewContainer.removeAllViews();
            mRemoteViewContainer.setClickable(false);
        }
        else {
            RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                    this.getResources().getDisplayMetrics().widthPixels, this.getResources()
                    .getDisplayMetrics().heightPixels);
            mRemoteViewContainer.removeView(remoteView);
            mRemoteViewContainer.addView(remoteView, layoutParams);
            mRemoteViewContainer.setClickable(true);
        }
    }
}
