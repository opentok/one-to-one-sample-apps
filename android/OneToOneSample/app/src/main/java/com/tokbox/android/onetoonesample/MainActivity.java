package com.tokbox.android.onetoonesample;

import android.Manifest;
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

import com.tokbox.android.accpack.OneToOneCommunication;
import com.tokbox.android.logging.OTKAnalytics;
import com.tokbox.android.logging.OTKAnalyticsData;

import com.tokbox.android.onetoonesample.config.OpenTokConfig;
import com.tokbox.android.onetoonesample.ui.PreviewCameraFragment;
import com.tokbox.android.onetoonesample.ui.PreviewControlFragment;
import com.tokbox.android.onetoonesample.ui.RemoteControlFragment;

import java.util.UUID;


public class MainActivity extends AppCompatActivity implements OneToOneCommunication.Listener, PreviewControlFragment.PreviewControlCallbacks, RemoteControlFragment.RemoteControlCallbacks, PreviewCameraFragment.PreviewCameraCallbacks {
    private final String LOGTAG = MainActivity.class.getSimpleName();

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

    private OTKAnalyticsData mAnalyticsData;
    private OTKAnalytics mAnalytics;

    private boolean mAudioPermission = false;
    private boolean mVideoPermission = false;

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

        //init 1to1 communication object
        mComm = new OneToOneCommunication(MainActivity.this, OpenTokConfig.SESSION_ID, OpenTokConfig.TOKEN, OpenTokConfig.API_KEY);
        mComm.setSubscribeToSelf(OpenTokConfig.SUBSCRIBE_TO_SELF);

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
            initRemoteFragment();
        }

        if (mComm != null) {
            mComm.reloadViews(); //reload the local preview and the remote views
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
            addLogEvent(OpenTokConfig.LOG_ACTION_END_COMM, OpenTokConfig.LOG_VARIATION_ATTEMPT);
            mComm.end();
            cleanViewsAndControls();
            addLogEvent(OpenTokConfig.LOG_ACTION_END_COMM, OpenTokConfig.LOG_VARIATION_SUCCESS);
        } else {
            addLogEvent(OpenTokConfig.LOG_ACTION_START_COMM, OpenTokConfig.LOG_VARIATION_ATTEMPT);
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

    @Override
    public void onInitialized() {
        Log.i(LOGTAG, "OneToOne communication has been initialized.");

        addLogEvent(OpenTokConfig.LOG_ACTION_START_COMM, OpenTokConfig.LOG_VARIATION_SUCCESS);
    }

    //OneToOneCommunication callbacks
    @Override
    public void onError(String error) {
        Log.i(LOGTAG, "Error: "+error);

        Toast.makeText(this, error, Toast.LENGTH_LONG).show();
        mComm.end(); //end communication
        cleanViewsAndControls(); //restart views
    }

    @Override
    public void onQualityWarning(boolean warning) {
        Log.i(LOGTAG, "The quality has degraded");

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
            Log.i(LOGTAG, "Audio only is enabled");
            mAudioOnlyView.setVisibility(View.VISIBLE);
        }
        else {
            Log.i(LOGTAG, "Audio only is disabled");
            mAudioOnlyView.setVisibility(View.GONE);
        }
    }

    @Override
    public void onPreviewReady(View preview) {
        mPreviewViewContainer.removeAllViews();
        if (preview != null) {
            Log.i(LOGTAG, "The preview view is ready to be attached");
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
            }
            mPreviewViewContainer.addView(preview, layoutParamsPreview);
            if (!mComm.getLocalVideo()){
                onDisableLocalVideo(false);
            }
        }
    }

    @Override
    public void onRemoteViewReady(View remoteView) {
        //update preview when a new participant joined to the communication
        if (mPreviewViewContainer.getChildCount() > 0) {
            onPreviewReady(mPreviewViewContainer.getChildAt(0)); //main preview view
        }
        if (!mComm.isRemote()) {
            //clear views
            onAudioOnly(false);
            mRemoteViewContainer.removeView(remoteView);
            mRemoteViewContainer.setClickable(false);
        }
        else {
            Log.i(LOGTAG, "The remote view is ready to be attached.");
            //show remote view
            RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                    this.getResources().getDisplayMetrics().widthPixels, this.getResources()
                    .getDisplayMetrics().heightPixels);
            mRemoteViewContainer.removeView(remoteView);
            mRemoteViewContainer.addView(remoteView, layoutParams);
            mRemoteViewContainer.setClickable(true);
        }
    }

    @Override
    public void onReconnecting() {
        Log.i(LOGTAG, "The session is reconnecting.");
        Toast.makeText(this, R.string.reconnecting, Toast.LENGTH_LONG).show();
    }

    @Override
    public void onReconnected() {
        Log.i(LOGTAG, "The session reconnected.");
        Toast.makeText(this, R.string.reconnected, Toast.LENGTH_LONG).show();
    }

    @Override
    public void onCameraChanged(int newCameraId) {
        Log.i(LOGTAG, "The camera changed. New camera id is: "+newCameraId);
    }

    private void addLogEvent(String action, String variation){
        if ( mAnalytics!= null ) {
            mAnalytics.logEvent(action, variation);
        }
    }
}
