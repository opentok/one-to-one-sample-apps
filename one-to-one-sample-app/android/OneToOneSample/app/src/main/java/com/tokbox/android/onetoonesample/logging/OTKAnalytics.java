package com.tokbox.android.onetoonesample.logging;


import android.util.Log;

import com.tokbox.android.onetoonesample.config.OpenTokConfig;

import org.codehaus.jackson.map.ObjectMapper;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;


public class OTKAnalytics {

    private static final String LOGTAG = OTKAnalytics.class.getSimpleName();

    ObjectMapper mapper = new ObjectMapper();

    OTKAnalyticsData data;

    /**
     * Init the logging
     *
     * @param data  The OTKAnalytics data represents a new log entry
     *
     */
    public OTKAnalytics(OTKAnalyticsData data) {
        this.data = data;
    }

    /**
     * Log a new event defined by an action and a variation
     *
     * @param eventAction  The String eventAction represents a new action to log.
     *                     It could not be empty or null.
     * @param eventVariation The String eventVariaion represents a new variation of the action to log.
     *                     It could be empty
     */
    public void logEvent(String eventAction, String eventVariation){
        if (data != null && eventAction != null && eventVariation != null && !eventAction.isEmpty()) {
            this.data.setAction(eventAction);
            this.data.setVariation(eventVariation);
            this.data.setClientSystemTime(System.currentTimeMillis());
            try {
                String jsonInString = mapper.writeValueAsString(this.data);
                sendDataStr(jsonInString);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        else {
            Log.e(LOGTAG, "Analytics data cannot be null. EventAction and EventVariation cannot be null in the logEvent method");
        }
    }

    public OTKAnalyticsData getData() {
        return data;
    }

    public void setData(OTKAnalyticsData data) {
        this.data = data;
    }

    private void sendDataStr(final String jsonStr){

        new Thread() {
            public void run() {
                try {
                    Log.i(LOGTAG, "Send data to the logging server: "+jsonStr);

                    URL url = new URL(OpenTokConfig.LOGGING_BASE_URL);
                    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
                    conn.setRequestProperty("Accept", "application/json");
                    conn.setRequestProperty("Content-type", "application/json");

                    conn.setRequestMethod("POST");
                    conn.setDoOutput(true);

                    byte[] jsonBytes = jsonStr.getBytes("UTF-8");
                    conn.getOutputStream().write(jsonBytes);
                    conn.getOutputStream().flush();

                    Log.i(LOGTAG, "Response code: "+conn.getResponseCode());

                } catch (MalformedURLException e) {
                    e.printStackTrace();
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                } catch (ProtocolException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }

            }
        }.start();
    }
}
