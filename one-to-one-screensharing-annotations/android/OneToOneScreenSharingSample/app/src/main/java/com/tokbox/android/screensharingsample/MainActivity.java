package com.tokbox.android.screensharingsample;

import android.Manifest;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.tokbox.android.accpack.annotations.AnnotationsToolbar;
import com.tokbox.android.accpack.annotations.AnnotationsView;
import com.tokbox.android.accpack.screensharing.ScreenSharingFragment;
import com.tokbox.android.screensharingsample.config.OpenTokConfig;
import com.tokbox.android.screensharingsample.ui.PreviewCameraFragment;
import com.tokbox.android.screensharingsample.ui.PreviewControlFragment;
import com.tokbox.android.screensharingsample.ui.RemoteControlFragment;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

public class MainActivity extends AppCompatActivity implements OneToOneCommunication.Listener, PreviewControlFragment.PreviewControlCallbacks,
        RemoteControlFragment.RemoteControlCallbacks, PreviewCameraFragment.PreviewCameraCallbacks, ScreenSharingFragment.ScreenSharingListener, AnnotationsView.AnnotationsListener{

    private final String LOG_TAG = MainActivity.class.getSimpleName();

    private final String[] permissions = {Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA, Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE};
    private final int permsRequestCode = 200;

    //OpenTok calls
    private OneToOneCommunication mComm;

    private RelativeLayout mPreviewViewContainer;
    private RelativeLayout mRemoteViewContainer;
    private RelativeLayout mAudioOnlyView;
    private RelativeLayout mLocalAudioOnlyView;
    private RelativeLayout.LayoutParams layoutParamsPreview;
    private RelativeLayout mCameraFragmentContainer;
    private RelativeLayout mActionBarContainer;
    private FrameLayout mScreenSharingContainer;

    private TextView mAlert;
    private ImageView mAudioOnlyImage;

    //UI control bars fragments
    private PreviewControlFragment mPreviewFragment;
    private RemoteControlFragment mRemoteFragment;
    private PreviewCameraFragment mCameraFragment;
    private FragmentTransaction mFragmentTransaction;

    //ScreenSharing fragment
    private ScreenSharingFragment mScreenSharingFragment;

    //Dialog
    ProgressDialog mProgressDialog;

    private AnnotationsToolbar mAnnotationsToolbar;
    private boolean screenshot;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.i(LOG_TAG, "onCreate");

        requestWindowFeature(Window.FEATURE_ACTION_BAR);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mPreviewViewContainer = (RelativeLayout) findViewById(R.id.publisherview);
        mRemoteViewContainer = (RelativeLayout) findViewById(R.id.subscriberview);
        mAlert = (TextView) findViewById(R.id.quality_warning);
        mAudioOnlyView = (RelativeLayout) findViewById(R.id.audioOnlyView);
        mLocalAudioOnlyView = (RelativeLayout) findViewById(R.id.localAudioOnlyView);
        mCameraFragmentContainer = (RelativeLayout) findViewById(R.id.camera_preview_fragment_container);
        mActionBarContainer = (RelativeLayout) findViewById(R.id.actionbar_preview_fragment_container);
        mScreenSharingContainer = (FrameLayout) findViewById(R.id.screensharing_fragment_container);

        mAnnotationsToolbar = (AnnotationsToolbar) findViewById(R.id.annotations_bar);

         //request Marshmallow camera permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(permissions, permsRequestCode);
        }

        //init 1to1 communication object
        mComm = new OneToOneCommunication(MainActivity.this);
        //set listener to receive the communication events, and add UI to these events
        mComm.setListener(this);
        mComm.init();

        //init controls fragments
        if (savedInstanceState == null) {
            mFragmentTransaction = getSupportFragmentManager().beginTransaction();
            initCameraFragment(); //to swap camera
            initPreviewFragment(); //to enable/disable local media
            initRemoteFragment(); //to enable/disable remote media
            initScreenSharingFragment();//to start/stop sharing the screen
            mFragmentTransaction.commitAllowingStateLoss();
        }

        //show connecting dialog
        mProgressDialog = new ProgressDialog(this);
        mProgressDialog.setTitle("Please wait");
        mProgressDialog.setMessage("Connecting...");
        mProgressDialog.show();

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
    protected void onResume() {
        super.onResume();

        if (mComm != null && mScreenSharingFragment!= null  && screenshot) {
            onScreenSharing();
            screenshot = false;
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mComm.destroy();
    }

    @Override
    public void onRequestPermissionsResult(int permsRequestCode, String[] permissions,
                                           int[] grantResults) {
        switch (permsRequestCode) {
            case 200:
                boolean video = grantResults[0] == PackageManager.PERMISSION_GRANTED;
                boolean audio = grantResults[1] == PackageManager.PERMISSION_GRANTED;
                boolean readExternalStorage = grantResults[2] == PackageManager.PERMISSION_GRANTED;
                boolean writeExternalStorage = grantResults[3] == PackageManager.PERMISSION_GRANTED;
                break;
        }
    }

    //Get OneToOneCommunicator object
    public OneToOneCommunication getComm() {
        return mComm;
    }

    public void showRemoteControlBar(View v) {
        if (mRemoteFragment != null && mComm.isRemote()) {
            mRemoteFragment.show();
        }
    }

    //Video local button event
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

    //Call button event
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

    @Override
    public void onScreenSharing() {

        if (mScreenSharingFragment.isStarted()) {
            Log.i(LOG_TAG, "Screensharing stop");
            mScreenSharingFragment.stop();
            showAVCall(true);
        }

        if (mScreenSharingFragment != null) {
            if (!mScreenSharingFragment.isStarted()) {
                showAVCall(false);
                mScreenSharingFragment.start();
            }
        }
    }

    //Audio remote button event
    @Override
    public void onDisableRemoteAudio(boolean audio) {
        if (mComm != null) {
            mComm.enableRemoteMedia(OneToOneCommunication.MediaType.AUDIO, audio);
        }
    }

    //Video remote button event
    @Override
    public void onDisableRemoteVideo(boolean video) {
        if (mComm != null) {
            mComm.enableRemoteMedia(OneToOneCommunication.MediaType.VIDEO, video);
        }
    }

    //Camera control button event
    @Override
    public void onCameraSwap() {
        if (mComm != null) {
            mComm.swapCamera();
        }
    }

    //OneToOneCommunicator listener events
    @Override
    public void onInitialized() {
        mProgressDialog.dismiss();
    }

    @Override
    public void onScreencaptureReady(Bitmap bmp) {
        saveScreencapture(bmp);
    }

    //OneToOneCommunication callbacks
    @Override
    public void onError(String error) {
        Toast.makeText(this, error, Toast.LENGTH_LONG).show();
        mComm.end(); //end communication
        mProgressDialog.dismiss();
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
        } else {
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
                if (mComm.getLocalVideo()) {
                    preview.setBackgroundResource(R.drawable.preview);
                }
            } else {
                preview.setBackground(null);
            }

            mPreviewViewContainer.addView(preview);
            mPreviewViewContainer.setLayoutParams(layoutParamsPreview);
            if (!mComm.getLocalVideo() && !mComm.isScreensharing()) {
                onDisableLocalVideo(false);
            }
        }
    }

    @Override
    public void onRemoteViewReady(View remoteView) {
        //update preview when a new participant joined to the communication
        if ( remoteView != null ) {
            // check if it is screensharing
            if (mComm.isScreensharing() && mComm.isRemote()) {
                mRemoteViewContainer.removeAllViews();
                mPreviewViewContainer.removeAllViews();
                onPreviewReady(mComm.getRemoteVideoView());
                if ( mComm.getRemoteScreenView() != null ) {
                    //show remote view
                    RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                            this.getResources().getDisplayMetrics().widthPixels, this.getResources()
                            .getDisplayMetrics().heightPixels);
                    mRemoteViewContainer.addView(mComm.getRemoteScreenView(), layoutParams);
                }
            } else {

                if (mComm.isStarted()) {
                    onPreviewReady(mComm.getPreviewView()); //main preview view
                }
                if (!mComm.isRemote()) {
                    //clear views
                    onAudioOnly(false);
                    mRemoteViewContainer.removeView(remoteView);
                    mRemoteViewContainer.setClickable(false);
                } else {
                    if (mComm.getRemoteVideoView() != null) {
                        //show remote view
                        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                                this.getResources().getDisplayMetrics().widthPixels, this.getResources()
                                .getDisplayMetrics().heightPixels);
                        mRemoteViewContainer.removeView(remoteView);

                        mRemoteViewContainer.addView(mComm.getRemoteVideoView(), layoutParams);
                        mRemoteViewContainer.setClickable(true);
                    }
                }
            }
            mActionBarContainer.setBackgroundColor(getResources().getColor(R.color.bckg_bar));
        }
    }

    //Private methods

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

    private void initScreenSharingFragment() {
        mScreenSharingFragment = ScreenSharingFragment.newInstance(mComm.getSession(), OpenTokConfig.API_KEY);
        mScreenSharingFragment.enableAnnotations(true, mAnnotationsToolbar);
        mScreenSharingFragment.setListener(this);
        getSupportFragmentManager().beginTransaction()
                .add(R.id.screensharing_fragment_container, mScreenSharingFragment).commit();
    }

    //Audio local button event
    @Override
    public void onDisableLocalAudio(boolean audio) {
        if (mComm != null) {
            mComm.enableLocalMedia(OneToOneCommunication.MediaType.AUDIO, audio);
        }
    }

    //cleans views and controls
    private void cleanViewsAndControls() {
        mPreviewFragment.restart();
        mActionBarContainer.setBackground(null);
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

    /**
     * Converts dp to real pixels, according to the screen density.
     *
     * @param dp A number of density-independent pixels.
     * @return The equivalent number of real pixels.
     */
    private int dpToPx(int dp) {
        double screenDensity = this.getResources().getDisplayMetrics().density;
        return (int) (screenDensity * (double) dp);
    }

    @Override
    public void onScreenSharingStarted() {
        Log.i(LOG_TAG, "onScreenSharingStarted");
    }

    @Override
    public void onScreenSharingStopped() {
        Log.i(LOG_TAG, "onScreenSharingStopped");
    }

    @Override
    public void onScreenSharingError(String error) {
        Log.i(LOG_TAG, "onScreenSharingError " + error);
    }

    @Override
    public void onAnnotationsViewReady(AnnotationsView view) {
        Log.i(LOG_TAG, "onAnnotationsViewReady ");
        view.setAnnotationsListener(this);
    }

    @Override
    public void onClosed() {
        onScreenSharing();
    }

    public void saveScreencapture(Bitmap bmp) {

        if (bmp != null) {
            String filename;
            Date date = new Date();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
            filename = sdf.format(date);
            try {
                String path = Environment.getExternalStorageDirectory().toString() + "/PICTURES/Screenshots/";
                OutputStream fOut = null;
                File file = new File(path, filename + ".jpg");
                fOut = new FileOutputStream(file);

                bmp.compress(Bitmap.CompressFormat.JPEG, 85, fOut);
                fOut.flush();
                fOut.close();

                MediaStore.Images.Media.insertImage(getContentResolver()
                        , file.getAbsolutePath(), file.getName(), file.getName());


                openScreenshot(file);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void openScreenshot(File imageFile) {
        Uri uri = Uri.fromFile(imageFile);
        Intent intentSend = new Intent();
        intentSend.setAction(Intent.ACTION_SEND);
        intentSend.setType("image/*");

        intentSend.putExtra(android.content.Intent.EXTRA_SUBJECT, "");
        intentSend.putExtra(android.content.Intent.EXTRA_TEXT, "");
        intentSend.putExtra(Intent.EXTRA_STREAM, uri);
        startActivity(Intent.createChooser(intentSend, "Share Screenshot"));
        screenshot = true;
    }

}

