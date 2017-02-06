package com.tokbox.android.onetoonesample;

import android.Manifest;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.opentok.android.OpentokError;
import com.tokbox.android.onetoonesample.config.OpenTokConfig;
import com.tokbox.android.onetoonesample.ui.PreviewCameraFragment;
import com.tokbox.android.onetoonesample.ui.PreviewControlFragment;
import com.tokbox.android.onetoonesample.ui.RemoteControlFragment;
import com.tokbox.android.otsdkwrapper.listeners.AdvancedListener;
import com.tokbox.android.otsdkwrapper.listeners.BasicListener;
import com.tokbox.android.otsdkwrapper.listeners.ListenerException;
import com.tokbox.android.otsdkwrapper.listeners.PausableAdvancedListener;
import com.tokbox.android.otsdkwrapper.listeners.PausableBasicListener;
import com.tokbox.android.otsdkwrapper.utils.MediaType;
import com.tokbox.android.otsdkwrapper.utils.OTConfig;
import com.tokbox.android.otsdkwrapper.utils.PreviewConfig;
import com.tokbox.android.otsdkwrapper.wrapper.OTWrapper;

import java.util.UUID;
import android.widget.FrameLayout;


import java.util.UUID;

public class MainActivity extends AppCompatActivity implements PreviewControlFragment.PreviewControlCallbacks,
        RemoteControlFragment.RemoteControlCallbacks, PreviewCameraFragment.PreviewCameraCallbacks {

    private final String LOG_TAG = MainActivity.class.getSimpleName();

    private final String[] permissions = {Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA};
    private final int permsRequestCode = 200;

    private RelativeLayout mPreviewViewContainer;
    private RelativeLayout mRemoteViewContainer;
    private RelativeLayout.LayoutParams mLayoutParamsPreview;
    private String mRemoteId;
    private View mRemoteView;
    private TextView mAlert;

    //Audio only views
    private RelativeLayout mLocalAudioOnlyView;
    private RelativeLayout mRemoteAudioOnlyView;
    private ImageView mLocalAudioOnlyImage;

    //UI control bars fragments
    private PreviewControlFragment mPreviewFragment;
    private RemoteControlFragment mRemoteFragment;
    private PreviewCameraFragment mCameraFragment;
    private FragmentTransaction mFragmentTransaction;

    //Loading dialog
    ProgressDialog mProgressDialog;

    //Permissions
    private boolean mAudioPermission = false;
    private boolean mVideoPermission = false;

    //Communication status
    private boolean isConnected = false;
    private boolean isLocal = false;
    private boolean isCallInProgress = false;

    private OTWrapper mWrapper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.i(LOG_TAG, "onCreate");

        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        mPreviewViewContainer = (RelativeLayout) findViewById(R.id.publisherview);
        mRemoteViewContainer = (RelativeLayout) findViewById(R.id.subscriberview);
        mAlert = (TextView) findViewById(R.id.quality_warning);

        //remote and local audio only view
        mRemoteAudioOnlyView = (RelativeLayout) findViewById(R.id.remoteAudioOnlyView);
        mLocalAudioOnlyView = (RelativeLayout) findViewById(R.id.localAudioOnlyView);

        //request Marshmallow camera permission
        if (ContextCompat.checkSelfPermission(this, permissions[1]) != PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this, permissions[0]) != PackageManager.PERMISSION_GRANTED) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                requestPermissions(permissions, permsRequestCode);
            }
        } else {
            mVideoPermission = true;
            mAudioPermission = true;
        }

        //init the wrapper
        OTConfig config =
                new OTConfig.OTConfigBuilder(OpenTokConfig.SESSION_ID, OpenTokConfig.TOKEN,
                        OpenTokConfig.API_KEY).name("one-to-one-sample-app").subscribeAutomatically(false).subscribeToSelf(false).build();
        if ( config != null ) {
            mWrapper = new OTWrapper(MainActivity.this, config);
            mWrapper.addBasicListener(mBasicListener);
            mWrapper.addAdvancedListener(mAdvancedListener);

            if (mWrapper != null) {
                mWrapper.connect();
            }

            //init controls fragments
            if (savedInstanceState == null) {
                mFragmentTransaction = getSupportFragmentManager().beginTransaction();
                initCameraFragment(); //to swap camera
                initPreviewFragment(); //to enable/disable local media
                mFragmentTransaction.commitAllowingStateLoss();
            }

            //show connecting dialog
            mProgressDialog = new ProgressDialog(this);
            mProgressDialog.setTitle("Please wait");
            mProgressDialog.setMessage("Connecting...");
            mProgressDialog.show();
        }
        else {
            Log.e(LOG_TAG, "OpenTok credentials are invalid");
            Toast.makeText(MainActivity.this, "Credentials are invalid", Toast.LENGTH_LONG).show();
            this.finish();
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        reloadViews();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mWrapper != null) {
            mWrapper.pause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if ( mWrapper != null ){
            mWrapper.resume(true);
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        if ( mWrapper != null && isConnected ){
            mWrapper.disconnect();
        }
    }

    @Override
    public void onRequestPermissionsResult(final int permsRequestCode, final String[] permissions,
                                           int[] grantResults) {
        switch (permsRequestCode) {
            case 200:
                mVideoPermission = grantResults[0] == PackageManager.PERMISSION_GRANTED;
                mAudioPermission = grantResults[1] == PackageManager.PERMISSION_GRANTED;

                if (!mVideoPermission || !mAudioPermission) {
                    final AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);
                    builder.setTitle(getResources().getString(R.string.permissions_denied_title));
                    builder.setMessage(getResources().getString(R.string.alert_permissions_denied));
                    builder.setPositiveButton("I'M SURE", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    });
                    builder.setNegativeButton("RE-TRY", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                requestPermissions(permissions, permsRequestCode);
                            }
                        }
                    });
                    builder.show();
                }
                break;
        }
    }

    public void showRemoteControlBar(View v) {
        if ( mRemoteFragment != null && mRemoteId != null ) {
            mRemoteFragment.show();
        }
    }

    public boolean isCallInProgress() {
        return isCallInProgress;
    }

    public OTWrapper getWrapper() {
        return mWrapper;
    }

    //Private methods
    //Init the local fragment
    private void initPreviewFragment() {
        mPreviewFragment = new PreviewControlFragment();
        getSupportFragmentManager().beginTransaction()
                .add(R.id.actionbar_preview_fragment_container, mPreviewFragment).commit();
    }

    //Inti the remote fragment
    private void initRemoteFragment(String remoteId) {
        mRemoteFragment = new RemoteControlFragment();

        Bundle args = new Bundle();
        args.putString("remoteId", remoteId);
        mRemoteFragment.setArguments(args);

        getSupportFragmentManager().beginTransaction()
                .add(R.id.actionbar_remote_fragment_container, mRemoteFragment).commit();
    }

    //Init the local camera fragment
    private void initCameraFragment() {
        mCameraFragment = new PreviewCameraFragment();
        getSupportFragmentManager().beginTransaction()
                .add(R.id.camera_preview_fragment_container, mCameraFragment).commit();
    }

    //Clean views
    private void cleanViewsAndControls() {
        if ( mRemoteId != null ) {
            mWrapper.removeRemote(mRemoteId);
            mRemoteView = null;
            setRemoteView(null);
        }
        if (isLocal) {
            isLocal = false;
            setLocalView(null);
        }
        if (mPreviewFragment != null)
            mPreviewFragment.restart();
        if (mRemoteFragment != null)
            mRemoteFragment.restart();
    }

    //Reload views
    private void reloadViews(){
        mRemoteViewContainer.removeAllViews();

        if (mRemoteId != null){
            setRemoteView(mWrapper.getRemoteStreamStatus(mRemoteId).getView());
        }
    }

    //Check if there are some connected remotes in the session
    private void checkRemotes(){
        if (mRemoteId != null){
            //add the remote participant to the communication
            mWrapper.addRemote(mRemoteId);
            //check the status of the remote video stream
            if (!mWrapper.isReceivedMediaEnabled(mRemoteId, MediaType.VIDEO)){
                onRemoteAudioOnly(true);
            }
            else {
                setRemoteView(mWrapper.getRemoteStreamStatus(mRemoteId).getView());
            }
        }
    }

    //Set the local participant view
    private void setLocalView(View localView){
        if (localView != null) {
            mPreviewViewContainer.removeAllViews();
            isLocal = true;
            mLayoutParamsPreview = new RelativeLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
            if (mRemoteId != null) {
                mLayoutParamsPreview.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM,
                        RelativeLayout.TRUE);
                mLayoutParamsPreview.addRule(RelativeLayout.ALIGN_PARENT_RIGHT,
                        RelativeLayout.TRUE);
                mLayoutParamsPreview.width = (int) getResources().getDimension(R.dimen.preview_width);
                mLayoutParamsPreview.height = (int) getResources().getDimension(R.dimen.preview_height);
                mLayoutParamsPreview.rightMargin = (int) getResources().getDimension(R.dimen.preview_rightMargin);
                mLayoutParamsPreview.bottomMargin = (int) getResources().getDimension(R.dimen.preview_bottomMargin);
            }
            mPreviewViewContainer.addView(localView, mLayoutParamsPreview);
        }
        else {
            mPreviewViewContainer.removeAllViews();
        }
    }

    //Set the remote participant view
    private void setRemoteView(View remoteView) {
        if (mPreviewViewContainer.getChildCount() > 0) {
            setLocalView(mPreviewViewContainer.getChildAt(0)); //main preview view
        }
        if (remoteView != null) {
            //show remote view
            RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                    this.getResources().getDisplayMetrics().widthPixels, this.getResources()
                    .getDisplayMetrics().heightPixels);
            mRemoteViewContainer.removeView(remoteView);
            mRemoteViewContainer.addView(remoteView, layoutParams);
            mRemoteViewContainer.setClickable(true);
            if (mRemoteFragment != null)
                mRemoteFragment.show();
        } else { //view null --> remove view
            if (mRemoteViewContainer.getChildCount() > 0) {
                mRemoteViewContainer.removeAllViews();
            }
            mRemoteViewContainer.setClickable(false);
            mRemoteAudioOnlyView.setVisibility(View.GONE);
        }
    }

    //Set the remote audio only view
    private void onRemoteAudioOnly(boolean enabled) {
        if (mRemoteView != null) {
            if (enabled) {
                mRemoteView.setVisibility(View.GONE);
                mRemoteAudioOnlyView.setVisibility(View.VISIBLE);
            } else {
                mRemoteAudioOnlyView.setVisibility(View.GONE);
                mRemoteView.setVisibility(View.VISIBLE);
            }
        }
    }

    //Converts dp to real pixels, according to the screen density.
    private int dpToPx(int dp) {
        double screenDensity = this.getResources().getDisplayMetrics().density;
        return (int) (screenDensity * (double) dp);
    }

    //Basic Listener from OTWrapper
    private BasicListener mBasicListener =
            new PausableBasicListener(new BasicListener<OTWrapper>() {
                @Override
                public void onConnected(OTWrapper otWrapper, int participantsCount, String connId, String data) throws ListenerException {
                    Log.i(LOG_TAG, "Connected to the session. Number of participants: "+participantsCount);
                    isConnected = true;
                    mProgressDialog.dismiss();
                }

                @Override
                public void onDisconnected(OTWrapper otWrapper, int participantsCount, String connId, String data) throws ListenerException {
                    Log.i(LOG_TAG, "Connection dropped: "+connId);
                    if ( connId == mWrapper.getOwnConnId() ) {
                        Log.i(LOG_TAG, "Disconnected to the session");
                        cleanViewsAndControls();
                    }
                }

                @Override
                public void onPreviewViewReady(OTWrapper otWrapper, View localView) throws ListenerException {
                    Log.i(LOG_TAG, "Local preview view is ready");
                    setLocalView(localView);
                }

                @Override
                public void onPreviewViewDestroyed(OTWrapper otWrapper, View localView) throws ListenerException {
                    Log.i(LOG_TAG, "Local preview view is destroyed");
                    setLocalView(null);
                }

                @Override
                public void onRemoteViewReady(OTWrapper otWrapper, View remoteView, String remoteId, String data) throws ListenerException {
                    Log.i(LOG_TAG, "Remove view is ready");
                    if ( remoteId == mRemoteId ) {
                        if (isCallInProgress()) {
                            setRemoteView(remoteView);
                        }
                        mRemoteView = remoteView;
                    }
                }

                @Override
                public void onRemoteViewDestroyed(OTWrapper otWrapper, View remoteView, String remoteId) throws ListenerException {
                    Log.i(LOG_TAG, "Remote view is destroyed");
                    setRemoteView(null);
                    mRemoteView = null;
                }


                @Override
                public void onStartedPublishingMedia(OTWrapper otWrapper, boolean screensharing) throws ListenerException {
                    Log.i(LOG_TAG, "Local started streaming video.");
                    //Check if there are some connected remotes
                    checkRemotes();
                }

                @Override
                public void onStoppedPublishingMedia(OTWrapper otWrapper, boolean screensharing) throws ListenerException {
                    Log.i(LOG_TAG, "Local stopped streaming video.");
                }

                @Override
                public void onRemoteJoined(OTWrapper otWrapper, String remoteId) throws ListenerException {
                    Log.i(LOG_TAG, "A new remote joined.");
                    if (mRemoteId == null){ //one-to-one, the first to arrive, will be the used
                        MainActivity.this.mRemoteId = remoteId;
                        initRemoteFragment(remoteId);
                        if (mWrapper.isPublishing()){
                            mWrapper.addRemote(mRemoteId);
                        }
                    }
                }

                @Override
                public void onRemoteLeft(OTWrapper otWrapper, String remoteId) throws ListenerException {
                    Log.i(LOG_TAG, "A new remote left.");
                    if ( mRemoteId != null && remoteId == mRemoteId ) { //one-to-one
                        mRemoteId = null;
                    }
                }

                @Override
                public void onRemoteVideoChanged(OTWrapper otWrapper, String remoteId, String reason, boolean videoActive, boolean subscribed) throws ListenerException {
                    Log.i(LOG_TAG, "Remote video changed");
                    if (isCallInProgress) {
                        if (reason.equals("quality")) {
                            //network quality alert
                            mAlert.setBackgroundResource(R.color.quality_alert);
                            mAlert.setTextColor(MainActivity.this.getResources().getColor(R.color.white));
                            mAlert.bringToFront();
                            mAlert.setVisibility(View.VISIBLE);
                            mAlert.postDelayed(new Runnable() {
                                public void run() {
                                    mAlert.setVisibility(View.GONE);
                                }
                            }, 7000);
                        }

                        if (!videoActive) {
                            onRemoteAudioOnly(true); //video is not active
                        } else {
                            onRemoteAudioOnly(false);
                        }
                    }
                }

                @Override
                public void onError(OTWrapper otWrapper, OpentokError error) throws ListenerException {
                    Log.i(LOG_TAG, "Error "+error.getErrorCode()+"-"+error.getMessage());

                    Toast.makeText(MainActivity.this, error.getMessage(), Toast.LENGTH_LONG).show();
                    mWrapper.disconnect(); //end communication
                    mProgressDialog.dismiss();
                    cleanViewsAndControls(); //restart views
                }
            });

    //Advanced Listener from OTWrapper
    private AdvancedListener mAdvancedListener =
            new PausableAdvancedListener(new AdvancedListener<OTWrapper>() {

                @Override
                public void onCameraChanged(OTWrapper otWrapper) throws ListenerException {
                    Log.i(LOG_TAG, "The camera changed");
                }

                @Override
                public void onReconnecting(OTWrapper otWrapper) throws ListenerException {
                    Log.i(LOG_TAG, "The session is reconnecting.");
                    Toast.makeText(MainActivity.this, R.string.reconnecting, Toast.LENGTH_LONG).show();
                }

                @Override
                public void onReconnected(OTWrapper otWrapper) throws ListenerException {
                    Log.i(LOG_TAG, "The session reconnected.");
                    Toast.makeText(MainActivity.this, R.string.reconnected, Toast.LENGTH_LONG).show();
                }

                @Override
                public void onVideoQualityWarning(OTWrapper otWrapper, String remoteId) throws ListenerException {
                    Log.i(LOG_TAG, "The quality has degraded");
                    mAlert.setBackgroundResource(R.color.quality_warning);
                    mAlert.setTextColor(MainActivity.this.getResources().getColor(R.color.warning_text));
                    mAlert.bringToFront();
                    mAlert.setVisibility(View.VISIBLE);
                    mAlert.postDelayed(new Runnable() {
                        public void run() {
                            mAlert.setVisibility(View.GONE);
                        }
                    }, 7000);
                }

                @Override
                public void onVideoQualityWarningLifted(OTWrapper otWrapper, String remoteId) throws ListenerException {
                    Log.i(LOG_TAG, "The quality has improved");
                }

                @Override
                public void onError(OTWrapper otWrapper, OpentokError error) throws ListenerException {
                    Log.i(LOG_TAG, "Error " + error.getErrorCode() + "-" + error.getMessage());
                    Toast.makeText(MainActivity.this, error.getMessage(), Toast.LENGTH_LONG).show();
                    mWrapper.disconnect(); //end communication
                    mProgressDialog.dismiss();
                    cleanViewsAndControls(); //restart views
                }
            });
    //Audio local button event
    @Override
    public void onDisableLocalAudio(boolean audio) {
        if (mWrapper != null) {
            mWrapper.enableLocalMedia(MediaType.AUDIO, audio);
        }
    }

    //Video local button event
    @Override
    public void onDisableLocalVideo(boolean video) {
        if (mWrapper != null) {
            mWrapper.enableLocalMedia(MediaType.VIDEO, video);
            if (mRemoteId != null) {
                if (!video) {
                    mLocalAudioOnlyImage = new ImageView(this);
                    mLocalAudioOnlyImage.setImageResource(R.drawable.avatar);
                    mLocalAudioOnlyImage.setBackgroundResource(R.drawable.bckg_audio_only);
                    mPreviewViewContainer.addView(mLocalAudioOnlyImage, mLayoutParamsPreview);
                } else {
                    mPreviewViewContainer.removeView(mLocalAudioOnlyImage);
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

    //Remote control callbacks
    @Override
    public void onDisableRemoteAudio(boolean audio) {
        if (mWrapper != null) {
            mWrapper.enableReceivedMedia(mRemoteId, MediaType.AUDIO, audio);
        }
    }

    @Override
    public void onDisableRemoteVideo(boolean video) {
        if (mWrapper != null) {
            mWrapper.enableReceivedMedia(mRemoteId, MediaType.VIDEO, video);
        }
    }

    //Camera control callback
    @Override
    public void onCameraSwap() {
        if (mWrapper != null) {
            mWrapper.cycleCamera();
        }
    }

    @Override
    public void onCall() {
        if (mWrapper != null && isConnected) {
            if (!isCallInProgress) {
                mWrapper.startPublishingMedia(new PreviewConfig.PreviewConfigBuilder().
                        name("Tokboxer").build(), false);
                if ( mPreviewFragment != null ) {
                    mPreviewFragment.setEnabled(true);
                }
                isCallInProgress = true;
            } else {
                mWrapper.stopPublishingMedia(false);
                isCallInProgress = false;
                cleanViewsAndControls();
            }
        }
    }
}
