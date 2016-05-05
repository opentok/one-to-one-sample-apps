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

import com.tokbox.android.textchatsample.MainActivity;
import com.tokbox.android.textchatsample.R;

public class PreviewCameraFragment extends Fragment {

    private static final String LOGTAG = MainActivity.class.getName();
    private MainActivity mActivity;

    private RelativeLayout mContainer;
    private View mRootView;
    private ImageButton mCameraBtn;

    private PreviewCameraCallbacks mCameraCallbacks = cameraCallbacks;

    public interface PreviewCameraCallbacks {
        public void onCameraSwap();
    }

    private static PreviewCameraCallbacks cameraCallbacks = new PreviewCameraCallbacks() {
        @Override
        public void onCameraSwap() {}

    };

    private View.OnClickListener mBtnClickListener = new View.OnClickListener() {
        public void onClick(View v) {
            cameraSwap();
        }
    };

    @Override
    public void onAttach(Context context) {
        Log.i(LOGTAG, "OnAttach PreviewCameraFragment");

        super.onAttach(context);

        this.mActivity = (MainActivity) context;
        this.mCameraCallbacks = (PreviewCameraCallbacks) context;
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {

            this.mActivity = (MainActivity) activity;
            this.mCameraCallbacks = (PreviewCameraCallbacks) activity;
        }

    }

    @Override
    public void onDetach() {
        Log.i(LOGTAG, "OnDetach PreviewCameraFragment");

        super.onDetach();

        mCameraCallbacks = cameraCallbacks;
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        Log.i(LOGTAG, "onCreate PreviewCameraFragment");

        mRootView = inflater.inflate(R.layout.preview_camera_fragment, container, false);

        mContainer = (RelativeLayout) this.mActivity.findViewById(R.id.camera_preview_fragment_container);
        mCameraBtn = (ImageButton) mRootView.findViewById(R.id.camera);

        mCameraBtn.setOnClickListener(mBtnClickListener);

        return mRootView;
    }

    public void cameraSwap() {
        mCameraCallbacks.onCameraSwap();
    }

}
