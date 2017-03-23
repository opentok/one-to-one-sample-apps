package com.tokbox.android.textchatsample;

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
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.opentok.android.OpentokError;
import com.tokbox.android.accpack.textchat.ChatMessage;
import com.tokbox.android.accpack.textchat.TextChatFragment;
import com.tokbox.android.logging.OTKAnalytics;
import com.tokbox.android.logging.OTKAnalyticsData;
import com.tokbox.android.otsdkwrapper.listeners.AdvancedListener;
import com.tokbox.android.otsdkwrapper.listeners.BasicListener;
import com.tokbox.android.otsdkwrapper.listeners.ListenerException;
import com.tokbox.android.otsdkwrapper.listeners.PausableAdvancedListener;
import com.tokbox.android.otsdkwrapper.listeners.PausableBasicListener;
import com.tokbox.android.otsdkwrapper.utils.MediaType;
import com.tokbox.android.otsdkwrapper.utils.OTConfig;
import com.tokbox.android.otsdkwrapper.utils.PreviewConfig;
import com.tokbox.android.otsdkwrapper.wrapper.OTWrapper;
import com.tokbox.android.textchatsample.config.OpenTokConfig;
import com.tokbox.android.textchatsample.ui.PreviewCameraFragment;
import com.tokbox.android.textchatsample.ui.PreviewControlFragment;
import com.tokbox.android.textchatsample.ui.RemoteControlFragment;

import java.util.UUID;

public class MainActivity extends AppCompatActivity implements PreviewControlFragment.PreviewControlCallbacks,
        RemoteControlFragment.RemoteControlCallbacks, PreviewCameraFragment.PreviewCameraCallbacks, TextChatFragment.TextChatListener {

    private final String LOG_TAG = MainActivity.class.getSimpleName();

    private final String[] permissions = {Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA};
    private final int permsRequestCode = 200;

    private RelativeLayout mPreviewViewContainer;
    private RelativeLayout mRemoteViewContainer;
    private RelativeLayout mRemoteAudioOnlyView;
    private RelativeLayout mLocalAudioOnlyView;
    private RelativeLayout.LayoutParams layoutParamsPreview;
    private FrameLayout mTextChatContainer;
    private RelativeLayout mCameraFragmentContainer;
    private RelativeLayout mActionBarContainer;

    private TextView mAlert;
    private ImageView mAudioOnlyImage;

    //UI control bars fragments
    private PreviewControlFragment mPreviewFragment;
    private RemoteControlFragment mRemoteFragment;
    private PreviewCameraFragment mCameraFragment;
    private FragmentTransaction mFragmentTransaction;

    //TextChat fragment
    private TextChatFragment mTextChatFragment;

    //Dialog
    ProgressDialog mProgressDialog;

    private boolean mAudioPermission = false;
    private boolean mVideoPermission = false;

    private OTWrapper mWrapper;

    //status
    private boolean isConnected = false;
    private boolean isLocal = false;
    private boolean isCallInProgress = false;

    private String mRemoteId;
    private View mRemoteView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.i(LOG_TAG, "onCreate");

        super.onCreate(savedInstanceState);

        //Init the analytics logging for internal use
        String source = this.getPackageName();

        SharedPreferences prefs = this.getSharedPreferences("opentok", Context.MODE_PRIVATE);
        String guidVSol = prefs.getString("guidVSol", null);
        if (null == guidVSol) {
            guidVSol = UUID.randomUUID().toString();
            prefs.edit().putString("guidVSol", guidVSol).commit();
        }

        setContentView(R.layout.activity_main);

        mPreviewViewContainer = (RelativeLayout) findViewById(R.id.publisherview);
        mRemoteViewContainer = (RelativeLayout) findViewById(R.id.subscriberview);
        mAlert = (TextView) findViewById(R.id.quality_warning);
        mRemoteAudioOnlyView = (RelativeLayout) findViewById(R.id.audioOnlyView);
        mLocalAudioOnlyView = (RelativeLayout) findViewById(R.id.localAudioOnlyView);
        mTextChatContainer = (FrameLayout) findViewById(R.id.textchat_fragment_container);
        mCameraFragmentContainer = (RelativeLayout) findViewById(R.id.camera_preview_fragment_container);
        mActionBarContainer = (RelativeLayout) findViewById(R.id.actionbar_preview_fragment_container);

        //request Marshmallow camera permission
        if (ContextCompat.checkSelfPermission(this, permissions[1]) != PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this, permissions[0]) != PackageManager.PERMISSION_GRANTED) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                requestPermissions(permissions, permsRequestCode);
            }
        } else {
            mVideoPermission = true;
            mAudioPermission = true;
        }

        //init the sdk-wrapper
        OTConfig config =
                new OTConfig.OTConfigBuilder(OpenTokConfig.SESSION_ID, OpenTokConfig.TOKEN,
                        OpenTokConfig.API_KEY).name("one-to-one-sample-app").subscribeAutomatically(true).subscribeToSelf(false).build();
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
                initTextChatFragment(); //to send/receive text-messages
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

    public boolean isConnected() {
        return isConnected;
    }

    public boolean isCallInProgress() {
        return isCallInProgress;
    }

    public OTWrapper getWrapper() {
        return mWrapper;
    }

    //Private methods
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

    private void initTextChatFragment() {
        mTextChatFragment = TextChatFragment.newInstance(mWrapper.getSession(), OpenTokConfig.API_KEY);
        getSupportFragmentManager().beginTransaction()
                .add(R.id.textchat_fragment_container, mTextChatFragment).commit();
        getSupportFragmentManager().executePendingTransactions();
        try {
            mTextChatFragment.setSenderAlias("Tokboxer");
            mTextChatFragment.setMaxTextLength(140);
        } catch (Exception e) {
            e.printStackTrace();
        }
        mTextChatFragment.setListener(this);
    }

    private void showAVCall(boolean show) {
        if (show) {
            mActionBarContainer.setVisibility(View.VISIBLE);
            mPreviewViewContainer.setVisibility(View.VISIBLE);
            mRemoteViewContainer.setVisibility(View.VISIBLE);
            mCameraFragmentContainer.setVisibility(View.VISIBLE);
        } else {
            mActionBarContainer.setVisibility(View.GONE);
            mPreviewViewContainer.setVisibility(View.GONE);
            mRemoteViewContainer.setVisibility(View.GONE);
            mCameraFragmentContainer.setVisibility(View.GONE);
        }
    }

    private void restartTextChatLayout(boolean restart) {
        RelativeLayout.LayoutParams params = (RelativeLayout.LayoutParams) mTextChatContainer.getLayoutParams();

        if (restart) {
            //restart to the original size
            params.width = RelativeLayout.LayoutParams.MATCH_PARENT;
            params.height = RelativeLayout.LayoutParams.MATCH_PARENT;
            params.addRule(RelativeLayout.ALIGN_PARENT_TOP);
            params.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM, 0);
        } else {
            //go to the minimized size
            params.height = dpToPx(40);
            params.addRule(RelativeLayout.ABOVE, R.id.actionbar_preview_fragment_container);
            params.addRule(RelativeLayout.ALIGN_PARENT_TOP, 0);
        }
        mTextChatContainer.setLayoutParams(params);
    }


    //Converts dp to real pixels, according to the screen density.
    private int dpToPx(int dp) {
        double screenDensity = this.getResources().getDisplayMetrics().density;
        return (int) (screenDensity * (double) dp);
    }

    //cleans views and controls
    private void cleanViewsAndControls() {
        if ( mRemoteId != null ) {
            mRemoteView = null;
            setRemoteView(null, mRemoteId);
        }
        if (isLocal) {
            isLocal = false;
            setLocalView(null);
        }

        if (mPreviewFragment != null)
            mPreviewFragment.restart();
        if (mRemoteFragment != null)
            mRemoteFragment.restart();
        if (mTextChatFragment != null) {
            restartTextChatLayout(true);
            mTextChatFragment.restart();
            mTextChatContainer.setVisibility(View.GONE);
        }
    }

    private void reloadViews(){
        mRemoteViewContainer.removeAllViews();

        if ( mRemoteId != null ){
            setRemoteView(mWrapper.getRemoteStreamStatus(mRemoteId).getView(), mRemoteId);
        }
    }

    private void checkRemotes(){
        if ( mRemoteId != null ){
            if (!mWrapper.isReceivedMediaEnabled(mRemoteId, MediaType.VIDEO)){
                onRemoteAudioOnly(true);
            }
            else {
                setRemoteView(mWrapper.getRemoteStreamStatus(mRemoteId).getView(), mRemoteId);
            }
        }
    }

    private void setLocalView(View localView){
        if (localView != null) {
            mPreviewViewContainer.removeAllViews();
            isLocal = true;
            layoutParamsPreview = new RelativeLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);

            if ( mRemoteId != null ) {
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
            mLocalAudioOnlyView.setVisibility(View.GONE);
            mPreviewViewContainer.removeAllViews();
        }
    }

    private void setRemoteView(View remoteView, String remoteId) {
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
                mRemoteViewContainer.removeViewAt(mRemoteViewContainer.getChildCount()-1);
            }
            mRemoteViewContainer.setClickable(false);
            mRemoteAudioOnlyView.setVisibility(View.GONE);
        }
    }

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
                            setRemoteView(remoteView, mRemoteId);
                        }
                        mRemoteView = remoteView;
                    }
                }

                @Override
                public void onRemoteViewDestroyed(OTWrapper otWrapper, View remoteView, String remoteId) throws ListenerException {
                    Log.i(LOG_TAG, "Remote view is destroyed");
                    setRemoteView(null, remoteId);
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

            if ( mRemoteId != null ) {
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
        Log.i(LOG_TAG, "OnCall");
        if ( mWrapper != null && isConnected ) {
            if ( !isCallInProgress ) {
                mWrapper.startPublishingMedia(new PreviewConfig.PreviewConfigBuilder().
                        name("Tokboxer").build(), false);
                if ( mPreviewFragment != null ) {
                    mPreviewFragment.setEnabled(true);
                }
                isCallInProgress = true;

                //Check if there are some connected remotes
                if ( mRemoteId != null ){
                    if (!mWrapper.isReceivedMediaEnabled(mRemoteId, MediaType.VIDEO)){
                        onRemoteAudioOnly(true);
                    }
                    else {
                        setRemoteView(mRemoteView, mRemoteId);
                    }
                }
            } else {
                mWrapper.stopPublishingMedia(false);
                isCallInProgress = false;
                cleanViewsAndControls();
            }
        }
    }

    //TextChat button event
    @Override
    public void onTextChat() {
        if (mTextChatContainer.getVisibility() == View.VISIBLE) {
            mTextChatContainer.setVisibility(View.GONE);
            showAVCall(true);
        } else {
            showAVCall(false);
            mTextChatContainer.setVisibility(View.VISIBLE);
        }
    }

    //TextChat Fragment listener events
    @Override
    public void onNewSentMessage(ChatMessage message) {
        Log.i(LOG_TAG, "New sent message");
    }

    @Override
    public void onNewReceivedMessage(ChatMessage message) {
        Log.i(LOG_TAG, "New received message");
        if (mTextChatContainer.getVisibility() != View.VISIBLE ) {
            mPreviewFragment.unreadMessages(true);
        }
        else
            mPreviewFragment.unreadMessages(false);
    }

    @Override
    public void onTextChatError(String error) {
        Log.i(LOG_TAG, "Error on text chat " + error);
    }

    @Override
    public void onClosed() {
        Log.i(LOG_TAG, "OnClosed text-chat");
        mTextChatContainer.setVisibility(View.GONE);
        showAVCall(true);
        mPreviewFragment.unreadMessages(false);
        restartTextChatLayout(true);
    }

    @Override
    public void onRestarted() {
        Log.i(LOG_TAG, "OnRestarted text-chat");
    }

}
