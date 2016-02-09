package com.opentok.android.avsample;

import android.app.Activity;
import android.app.FragmentTransaction;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.google.android.gms.common.api.GoogleApiClient;
import com.opentok.android.avsample.ui.PreviewCameraFragment;
import com.opentok.android.avsample.ui.PreviewControlFragment;
import com.opentok.android.avsample.ui.RemoteControlFragment;


public class MainActivity extends Activity implements PreviewControlFragment.PreviewControlCallbacks, RemoteControlFragment.RemoteControlCallbacks, PreviewCameraFragment.PreviewCameraCallbacks {
    private final String LOGTAG = "opentok-avsample";

    private final String[] permissions = {"android.permission.RECORD_AUDIO", "android.permission.CAMERA"};
    private final int permsRequestCode = 200;

    private RelativeLayout mPreviewViewContainer;
    private RelativeLayout mRemoteViewContainer;
    private RelativeLayout remoteAudioOnly;
    private TextView qualityWarning;

    private AVCommunication mComm;

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
        remoteAudioOnly = (RelativeLayout) findViewById(R.id.audioOnlyView);
        qualityWarning = (TextView) findViewById(R.id.quality_warning);

        //request Marshmallow camera permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(permissions, permsRequestCode);
        }

        //init audio video communication object
        mComm = new AVCommunication(MainActivity.this);
        mComm.setPreviewView(mPreviewViewContainer);
        mComm.setRemoteView(mRemoteViewContainer);

        //init controls fragments
        if (savedInstanceState == null) {
            mFragmentTransaction = getFragmentManager().beginTransaction();
            initCameraFragment();
            initPreviewFragment();
            initRemoteFragment();
            mFragmentTransaction.commitAllowingStateLoss();
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        if (mCameraFragment != null) {
            getFragmentManager().beginTransaction()
                    .remove(mCameraFragment).commit();
            initCameraFragment();
        }

        if (mPreviewFragment != null) {
            getFragmentManager().beginTransaction()
                    .remove(mPreviewFragment).commit();
            initPreviewFragment();
        }

        if (mRemoteFragment != null) {
            getFragmentManager().beginTransaction()
                    .remove(mRemoteFragment).commit();
            initRemoteFragment();
        }

        if (mComm != null) {
            mComm.reloadViews(); //reload the local preview and the remote view
        }

        }

        @Override
        public void onRequestPermissionsResult ( int permsRequestCode, String[] permissions,
        int[] grantResults){

            switch (permsRequestCode) {

                case 200:
                    boolean video = grantResults[0] == PackageManager.PERMISSION_GRANTED;
                    boolean audio = grantResults[1] == PackageManager.PERMISSION_GRANTED;
                    break;
            }
        }

    private void initPreviewFragment() {
        mPreviewFragment = new PreviewControlFragment();
        getFragmentManager().beginTransaction()
                .add(R.id.actionbar_preview_fragment_container, mPreviewFragment).commit();
    }

    private void initRemoteFragment() {
        mRemoteFragment = new RemoteControlFragment();
        getFragmentManager().beginTransaction()
                .add(R.id.actionbar_remote_fragment_container, mRemoteFragment).commit();
    }

    private void initCameraFragment() {
        mCameraFragment = new PreviewCameraFragment();
        getFragmentManager().beginTransaction()
                .add(R.id.camera_preview_fragment_container, mCameraFragment).commit();
    }

    public AVCommunication getComm() {
        return mComm;
    }

    //Local control callbacks
    @Override
    public void onMuteLocalAudio(boolean audio) {
        if (mComm != null) {
            mComm.enableLocalMedia(AVCommunication.MediaType.AUDIO, audio);
        }
    }

    @Override
    public void onMuteLocalVideo(boolean video) {
        if (mComm != null) {
            mComm.enableLocalMedia(AVCommunication.MediaType.VIDEO, video);
        }
    }

    @Override
    public void onCall() {
        if (mComm != null && mComm.isStarted()) {
            mComm.end();
            cleanViewsAndControls();
        } else {
            mComm.start();
            mPreviewFragment.setEnabled(true);
        }
    }

    //Remote control callbacks
    @Override
    public void onMuteRemoteAudio(boolean audio) {
        if (mComm != null) {
            mComm.enableRemoteMedia(AVCommunication.MediaType.AUDIO, audio);
        }
    }

    @Override
    public void onMuteRemoteVideo(boolean video) {
        if (mComm != null) {
          //  setRemoteAudioOnly(!video);
            mComm.enableRemoteMedia(AVCommunication.MediaType.VIDEO, video);
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
        //setRemoteAudioOnly(false); //clean views
        mPreviewFragment.setEnabled(false);
    }
}
