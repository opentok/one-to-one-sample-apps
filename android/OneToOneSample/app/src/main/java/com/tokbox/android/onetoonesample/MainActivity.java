package com.tokbox.android.onetoonesample;

import android.Manifest;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
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
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.opentok.android.OpentokError;
import com.tokbox.android.logging.OTKAnalytics;
import com.tokbox.android.logging.OTKAnalyticsData;

import com.tokbox.android.onetoonesample.config.OpenTokConfig;
import com.tokbox.android.onetoonesample.ui.PreviewCameraFragment;
import com.tokbox.android.onetoonesample.ui.PreviewControlFragment;
import com.tokbox.android.onetoonesample.ui.RemoteControlFragment;
import com.tokbox.android.otsdkwrapper.listeners.AdvancedListener;
import com.tokbox.android.otsdkwrapper.listeners.BasicListener;
import com.tokbox.android.otsdkwrapper.listeners.ListenerException;
import com.tokbox.android.otsdkwrapper.utils.MediaType;
import com.tokbox.android.otsdkwrapper.utils.OTConfig;
import com.tokbox.android.otsdkwrapper.utils.PreviewConfig;
import com.tokbox.android.otsdkwrapper.wrapper.OTWrapper;

import java.util.UUID;


public class MainActivity extends AppCompatActivity implements BasicListener, AdvancedListener, PreviewControlFragment.PreviewControlCallbacks, RemoteControlFragment.RemoteControlCallbacks, PreviewCameraFragment.PreviewCameraCallbacks {
    private final String LOGTAG = MainActivity.class.getSimpleName();

    private final String[] permissions = {Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA};
    private final int permsRequestCode = 200;

    //OpenTok calls
    private OTWrapper mWrapper;

    private RelativeLayout mPreviewViewContainer;
    private RelativeLayout mRemoteViewContainer;
    private RelativeLayout mAudioOnlyView;
    private RelativeLayout mLocalAudioOnlyView;
    private RelativeLayout.LayoutParams layoutParamsPreview;
    private TextView mAlert;
    private ImageView mAudioOnlyImage;
    private ProgressDialog mProgressDialog;

    //UI fragments
    private PreviewControlFragment mPreviewFragment;
    private RemoteControlFragment mRemoteFragment;
    private PreviewCameraFragment mCameraFragment;
    private FragmentTransaction mFragmentTransaction;

    //App permissions
    private boolean mAudioPermission = false;
    private boolean mVideoPermission = false;

    //status
    private boolean isConnected = false;
    private boolean isLocal = false;
    private boolean isRemote = false;
    private boolean isCallInProgress = false;

    //Remote
    private String mRemoteId;
    private View mRemoteView;

    //Internal Analytics
    private OTKAnalyticsData mAnalyticsData;
    private OTKAnalytics mAnalytics;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.i(LOGTAG, "onCreate");
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        //Init the analytics logging for internal use
        String source = this.getPackageName();

        SharedPreferences prefs = this.getSharedPreferences("opentok", Context.MODE_PRIVATE);
        String guidVSol = prefs.getString("guidVSol", null);
        if (null == guidVSol) {
            guidVSol = UUID.randomUUID().toString();
            prefs.edit().putString("guidVSol", guidVSol).commit();
        }

        mAnalyticsData = new OTKAnalyticsData.Builder(OpenTokConfig.LOG_CLIENT_VERSION, source, OpenTokConfig.LOG_COMPONENTID, guidVSol).build();
        mAnalytics = new OTKAnalytics(mAnalyticsData);

        //add INITIALIZE attempt log event
        addLogEvent(OpenTokConfig.LOG_ACTION_INITIALIZE, OpenTokConfig.LOG_VARIATION_ATTEMPT);


        mPreviewViewContainer = (RelativeLayout) findViewById(R.id.publisherview);
        mRemoteViewContainer = (RelativeLayout) findViewById(R.id.subscriberview);
        mAlert = (TextView) findViewById(R.id.quality_warning);
        mAudioOnlyView = (RelativeLayout) findViewById(R.id.audioOnlyView);
        mLocalAudioOnlyView = (RelativeLayout) findViewById(R.id.localAudioOnlyView);

        //request Marshmallow camera permission
        if (ContextCompat.checkSelfPermission(this,permissions[1]) != PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this,permissions[0]) != PackageManager.PERMISSION_GRANTED){
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                requestPermissions(permissions, permsRequestCode);
            }
        }
        else {
            mVideoPermission = true;
            mAudioPermission = true;
        }

        //init the sdk-wrapper
        OTConfig config =
                new OTConfig.OTConfigBuilder(OpenTokConfig.SESSION_ID, OpenTokConfig.TOKEN,
                        OpenTokConfig.API_KEY).name("one-to-one-sample-app").subscribeAutomatically(true).subscribeToSelf(false).build();

        mWrapper = new OTWrapper(MainActivity.this, config);
        mWrapper.setBasicListener(this);

        if ( mWrapper != null ) {
            mWrapper.connect();
        }

        //show connections dialog
        mProgressDialog = new ProgressDialog(this);
        mProgressDialog.setTitle("Please wait");
        mProgressDialog.setMessage("Connecting...");
        mProgressDialog.show();

        //init controls fragments
        if (savedInstanceState == null) {
            mFragmentTransaction = getSupportFragmentManager().beginTransaction();
            initCameraFragment(); //to swap camera
            initPreviewFragment(); //to enable/disable local media
            mFragmentTransaction.commitAllowingStateLoss();
        }

        //add INITIALIZE attempt log event
        addLogEvent(OpenTokConfig.LOG_ACTION_INITIALIZE, OpenTokConfig.LOG_VARIATION_SUCCESS);

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
            initRemoteFragment(mRemoteId);
        }

       /*todo if (mComm != null) {
            mComm.reloadViews(); //reload the local preview and the remote views
        }*/

    }

    @Override
    protected void onPause() {
        super.onPause();

        if ( mWrapper != null && isCallInProgress ){
            mWrapper.pause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        if ( mWrapper != null && isCallInProgress ){
            mWrapper.resume(true);
        }
    }

    @Override
    public void onRequestPermissionsResult(final int permsRequestCode, final String[] permissions,
                                           int[] grantResults) {
        switch (permsRequestCode) {

            case 200:
                mVideoPermission = grantResults[0] == PackageManager.PERMISSION_GRANTED;
                mAudioPermission = grantResults[1] == PackageManager.PERMISSION_GRANTED;


                if ( !mVideoPermission || !mAudioPermission ){
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

    private void initPreviewFragment() {
        mPreviewFragment = new PreviewControlFragment();
        getSupportFragmentManager().beginTransaction()
                .add(R.id.actionbar_preview_fragment_container, mPreviewFragment).commit();
    }

    private void initRemoteFragment(String remoteId) {
        mRemoteFragment = new RemoteControlFragment();

        Bundle args = new Bundle();
        args.putString("remoteId", remoteId);
        mRemoteFragment.setArguments(args);

        getSupportFragmentManager().beginTransaction()
                .add(R.id.actionbar_remote_fragment_container, mRemoteFragment).commit();
    }

    private void initCameraFragment() {
        mCameraFragment = new PreviewCameraFragment();
        getSupportFragmentManager().beginTransaction()
                .add(R.id.camera_preview_fragment_container, mCameraFragment).commit();
    }

    public OTWrapper getWrapper() {
        return mWrapper;
    }

    public boolean isCallInProgress() {
        return isCallInProgress;
    }

    public void showRemoteControlBar(View v) {
        if (mRemoteFragment != null && isRemote) {
            mRemoteFragment.show();
        }
    }

    //Local control callbacks
    @Override
    public void onDisableLocalAudio(boolean audio) {
        if (mWrapper != null) {
            mWrapper.enableLocalMedia(MediaType.AUDIO, audio);
        }
    }

    @Override
    public void onDisableLocalVideo(boolean video) {
        if (mWrapper != null) {
           mWrapper.enableLocalMedia(MediaType.VIDEO, video);

            if (isRemote) {
                if (!video) {
                    mAudioOnlyImage = new ImageView(this);
                    mAudioOnlyImage.setImageResource(R.drawable.avatar);
                    mAudioOnlyImage.setBackgroundResource(R.drawable.bckg_audio_only);
                    mPreviewViewContainer.addView(mAudioOnlyImage, layoutParamsPreview);
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
        Log.i(LOGTAG, "OnCall");
        if ( mWrapper != null && isConnected ) {
            if ( !isCallInProgress ) {
                mWrapper.startSharingMedia(new PreviewConfig.PreviewConfigBuilder().
                        name("Tokboxer").build());
                if ( mPreviewFragment != null ) {
                    mPreviewFragment.setEnabled(true);
                }
                isCallInProgress = true;

                //Check if there are some connected remotes
                if ( isRemote ){
                    if (!mWrapper.isRemoteMediaEnabled(mRemoteId, MediaType.VIDEO)){
                        onAudioOnly(true);
                    }
                    else {
                        setRemoteView(mRemoteView);
                    }
                }
            } else {
                mWrapper.stopSharingMedia();
                isCallInProgress = false;
                cleanViewsAndControls();
            }
        }
    }

    //Remote control callbacks
    @Override
    public void onDisableRemoteAudio(boolean audio) {
        if (mWrapper != null) {
            mWrapper.enableRemoteMedia(mRemoteId, MediaType.AUDIO, audio);
        }
    }

    @Override
    public void onDisableRemoteVideo(boolean video) {
        if (mWrapper != null) {
            mWrapper.enableRemoteMedia(mRemoteId, MediaType.VIDEO, video);
        }
    }

    //Camera control callback
    @Override
    public void onCameraSwap() {
        if (mWrapper != null) {
           mWrapper.cycleCamera();
        }
    }

    //cleans views and controls
    private void cleanViewsAndControls() {
        if (isRemote) {
            mRemoteView = null;
            isRemote = false;
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

    private void setLocalView(View localView){
        if (localView != null) {
            mPreviewViewContainer.removeAllViews();
            isLocal = true;
            layoutParamsPreview = new RelativeLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);

            if (isRemote) {
                layoutParamsPreview.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM,
                        RelativeLayout.TRUE);
                layoutParamsPreview.addRule(RelativeLayout.ALIGN_PARENT_RIGHT,
                        RelativeLayout.TRUE);
                layoutParamsPreview.width = (int) getResources().getDimension(R.dimen.preview_width);
                layoutParamsPreview.height = (int) getResources().getDimension(R.dimen.preview_height);
                layoutParamsPreview.rightMargin = (int) getResources().getDimension(R.dimen.preview_rightMargin);
                layoutParamsPreview.bottomMargin = (int) getResources().getDimension(R.dimen.preview_bottomMargin);
            }
            mPreviewViewContainer.addView(localView, layoutParamsPreview);
        }
        else {
            mPreviewViewContainer.removeAllViews();
        }
    }

    private void setRemoteView(View remoteView){
        if (mPreviewViewContainer.getChildCount() > 0) {
            setLocalView(mPreviewViewContainer.getChildAt(0)); //main preview view
        }

        if ( remoteView != null ){
            //show remote view
            RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                    this.getResources().getDisplayMetrics().widthPixels, this.getResources()
                    .getDisplayMetrics().heightPixels);
            mRemoteViewContainer.removeView(remoteView);
            mRemoteViewContainer.addView(remoteView, layoutParams);
            mRemoteViewContainer.setClickable(true);
            mRemoteFragment.show();
        }
        else {
            mRemoteViewContainer.removeViewAt(mRemoteViewContainer.getChildCount()-1);
            mRemoteViewContainer.setClickable(false);
            mAudioOnlyView.setVisibility(View.GONE);
        }
    }

    private void onAudioOnly(boolean enabled) {
        if (enabled) {
            mRemoteView.setVisibility(View.GONE);
            mAudioOnlyView.setVisibility(View.VISIBLE);
        }
        else {
            mAudioOnlyView.setVisibility(View.GONE);
            mRemoteView.setVisibility(View.VISIBLE);
        }
    }

    private void addLogEvent(String action, String variation){
        if ( mAnalytics!= null ) {
            mAnalytics.logEvent(action, variation);
        }
    }

    //Advanced Listener from OTWrapper
    @Override
    public void onCameraChanged(Object o) throws ListenerException {
        Log.i(LOGTAG, "The camera changed");
    }

    @Override
    public void onReconnecting(Object o) throws ListenerException {
        Log.i(LOGTAG, "The session is reconnecting.");
        Toast.makeText(this, R.string.reconnecting, Toast.LENGTH_LONG).show();
    }

    @Override
    public void onReconnected(Object o) throws ListenerException {
        Log.i(LOGTAG, "The session reconnected.");
        Toast.makeText(this, R.string.reconnected, Toast.LENGTH_LONG).show();
    }

    @Override
    public void onVideoQualityWarning(Object o, String remoteId) throws ListenerException {
        Log.i(LOGTAG, "The quality has degraded");

        mAlert.setBackgroundResource(R.color.quality_warning);
        mAlert.setTextColor(this.getResources().getColor(R.color.warning_text));

        mAlert.bringToFront();
        mAlert.setVisibility(View.VISIBLE);
        mAlert.postDelayed(new Runnable() {
            public void run() {
                mAlert.setVisibility(View.GONE);
            }
        }, 7000);
    }

    @Override
    public void onVideoQualityWarningLifted(Object o, String remoteId) throws ListenerException {
        Log.i(LOGTAG, "The quality has improved");
    }

    //Basic Listener from OTWrapper
    @Override
    public void onConnected(Object o, int participantsCount, String connId, String data) throws ListenerException {
        Log.i(LOGTAG, "Connected to the session. Number of participants: "+participantsCount);
        isConnected = true;
        mProgressDialog.dismiss();
        addLogEvent(OpenTokConfig.LOG_ACTION_START_COMM, OpenTokConfig.LOG_VARIATION_SUCCESS);
    }

    @Override
    public void onDisconnected(Object o, int participantsCount, String connId, String data) throws ListenerException {
        Log.i(LOGTAG, "Connection dropped: "+connId);
        if ( connId == mWrapper.getOwnConnId() ) {
            Log.i(LOGTAG, "Disconnected to the session");
            cleanViewsAndControls();
        }
    }

    @Override
    public void onPreviewViewReady(Object o, View localView) throws ListenerException {
        Log.i(LOGTAG, "Local preview view is ready");
        setLocalView(localView);
    }

    @Override
    public void onPreviewViewDestroyed(Object o, View localView) throws ListenerException {
        Log.i(LOGTAG, "Local preview view is destroyed");
        setLocalView(null);
    }

    @Override
    public void onRemoteViewReady(Object o, View remoteView, String remoteId, String data) throws ListenerException {
        Log.i(LOGTAG, "Remove view is ready");
        if ( remoteId == mRemoteId ) {
            if (isCallInProgress()) {
                setRemoteView(remoteView);
            }
            mRemoteView = remoteView;
            isRemote = true;
        }
    }

    @Override
    public void onRemoteViewDestroyed(Object o, View remoteView, String remoteId) throws ListenerException {
        Log.i(LOGTAG, "Remote view is destroyed");
        setRemoteView(null);
        mRemoteView = null;
    }

    @Override
    public void onStartedSharingMedia(Object o) throws ListenerException {
        Log.i(LOGTAG, "Local started streaming video.");
    }

    @Override
    public void onStoppedSharingMedia(Object o) throws ListenerException {
        Log.i(LOGTAG, "Local stopped streaming video.");
    }

    @Override
    public void onRemoteJoined(Object o, String remoteId) throws ListenerException {
        Log.i(LOGTAG, "A new remote joined.");
        if (mRemoteId == null){ //one-to-one, the first to arrive, will be the used
            this.mRemoteId = remoteId;
            isRemote = true;
            initRemoteFragment(remoteId);
        }
    }

    @Override
    public void onRemoteLeft(Object o, String remoteId) throws ListenerException {
        Log.i(LOGTAG, "A new remote left.");
        if ( mRemoteId != null && remoteId == mRemoteId ) { //one-to-one
            isRemote = false;
            mRemoteId = null;
        }
    }

    @Override
    public void onRemoteVideoChange(Object o, String remoteId, String reason, boolean videoActive, boolean subscribed) throws ListenerException {
        Log.i(LOGTAG, "Remote video changed");
        if (isCallInProgress) {
            if (reason.equals("quality")) {
                //network quality alert
                mAlert.setBackgroundResource(R.color.quality_alert);
                mAlert.setTextColor(this.getResources().getColor(R.color.white));
                mAlert.bringToFront();
                mAlert.setVisibility(View.VISIBLE);
                mAlert.postDelayed(new Runnable() {
                    public void run() {
                        mAlert.setVisibility(View.GONE);
                    }
                }, 7000);
            }

           if (!videoActive) {
                onAudioOnly(true); //video is not active
            } else {
                onAudioOnly(false);
            }
        }
    }

    @Override
    public void onError(Object o, OpentokError error) throws ListenerException {
        Log.i(LOGTAG, "Error "+error.getErrorCode()+"-"+error.getMessage());

        Toast.makeText(this, error.getMessage(), Toast.LENGTH_LONG).show();
        mWrapper.disconnect(); //end communication
        mProgressDialog.dismiss();
        cleanViewsAndControls(); //restart views
    }
}
