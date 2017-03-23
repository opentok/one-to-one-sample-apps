package com.tokbox.android.accpack.textchat.test;

import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.tokbox.android.accpack.textchat.TextChatFragment;
import com.tokbox.android.accpack.textchat.config.APIConfig;
import com.tokbox.android.accpack.textchat.testbase.TestBase;
import com.tokbox.android.otsdkwrapper.wrapper.OTAcceleratorSession;


import junit.framework.Assert;

public  class TextChatFragmentTest extends TestBase {

    private TextChatFragment textChatFragment;

    protected void setUp() throws Exception {
        super.setUp(APIConfig.SESSION_ID, APIConfig.TOKEN, APIConfig.API_KEY);
    }

    protected void tearDown() throws Exception {
        super.tearDown();
    }

    public void testTextChatFragmentWhenSessionIsNull() {
        try {
            textChatFragment = TextChatFragment.newInstance(null, apiKey);
            Assert.fail("Should have thrown an exception with null apikey");

        } catch (IllegalArgumentException e) {
            Assert.assertNull(textChatFragment);
        }
    }

    public void TextChatFragmentWhenApiKeyIsNull() throws Exception {
        session = new OTAcceleratorSession(context, null, sessionId);
        session.setSessionListener(sessionListener);
        session.connect(token);
        waitSessionConnected();
        textChatFragment = TextChatFragment.newInstance(session, null);

        Assert.assertNull(textChatFragment);
    }

    public void testTextChatFragmentWhenApiKeyIsEmpty() {
        try {
            session = new OTAcceleratorSession(context, apiKey, sessionId);
            session.setSessionListener(sessionListener);
            session.connect(token);
            waitSessionConnected();
            textChatFragment = TextChatFragment.newInstance(session, "");

            Assert.fail("Should have thrown an exception with an empty apikey");

        } catch (Exception e) {
            Assert.assertNull(textChatFragment);
        }
    }

    public void testSetMaxLengthWhenMaxLengthIsGTMAX() {
        try {
            session = new OTAcceleratorSession(context, apiKey, sessionId);
            session.setSessionListener(sessionListener);
            session.connect(token);
            waitSessionConnected();
            textChatFragment = TextChatFragment.newInstance(session, apiKey);

            Assert.assertNotNull(textChatFragment);

            //Assert greater than MAX
            textChatFragment.setMaxTextLength(8197);

            Assert.fail("Should have thrown an exception with text length higher than 8195");

        } catch (Exception e) {
            Assert.assertEquals(textChatFragment.getMaxTextLength(), 1000); //default max text length
        }

    }

    public void testSetMaxLengthWhenMaxLengthIsZero() {

        try {
            session = new OTAcceleratorSession(context, apiKey, sessionId);
            session.setSessionListener(sessionListener);
            session.connect(token);
            waitSessionConnected();
            textChatFragment = TextChatFragment.newInstance(session, apiKey);

            Assert.assertNotNull(textChatFragment);

            textChatFragment.setMaxTextLength(0);

            Assert.fail("Should have thrown an exception with text length less than 0");

        } catch (Exception e) {
            Assert.assertEquals(textChatFragment.getMaxTextLength(), 1000); //default max text length
        }
    }

    public void testSetMaxLengthWhenMaxLengthIsLTZero() {

        try {
            session = new OTAcceleratorSession(context, apiKey, sessionId);
            session.setSessionListener(sessionListener);
            session.connect(token);
            waitSessionConnected();
            textChatFragment = TextChatFragment.newInstance(session, apiKey);

            Assert.assertNotNull(textChatFragment);

            textChatFragment.setMaxTextLength(-1);

            Assert.fail("Should have thrown an exception with text length less than 0");

        } catch (Exception e) {
            Assert.assertEquals(textChatFragment.getMaxTextLength(), 1000); //default max text length
        }
    }

    public void testSetSenderAliasWhenSenderAliasIsNull() {
        try {
            session = new OTAcceleratorSession(context, apiKey, sessionId);
            session.setSessionListener(sessionListener);
            session.connect(token);
            waitSessionConnected();
            textChatFragment = TextChatFragment.newInstance(session, apiKey);

            Assert.assertNotNull(textChatFragment);

            textChatFragment.setSenderAlias(null);

            Assert.fail("Should have thrown an exception with a null alias");

        } catch (Exception e) {
            Assert.assertEquals(textChatFragment.getSenderAlias(), "me"); //default sender alias
        }
    }

    public void testSetSenderAliasWhenSenderAliasIsEmpty() {
        try {
            session = new OTAcceleratorSession(context, apiKey, sessionId);
            session.setSessionListener(sessionListener);
            session.connect(token);
            waitSessionConnected();
            textChatFragment = TextChatFragment.newInstance(session, apiKey);

            Assert.assertNotNull(textChatFragment);

            textChatFragment.setSenderAlias("");

            Assert.fail("Should have thrown an exception with an empty alias");

        } catch (Exception e) {
            Assert.assertEquals("me", textChatFragment.getSenderAlias()); //default sender alias
        }
    }

    public void testSetActionBarWhenOK() throws Exception {

        session = new OTAcceleratorSession(context, apiKey, sessionId);
        session.setSessionListener(sessionListener);
        session.connect(token);
        waitSessionConnected();
        textChatFragment = TextChatFragment.newInstance(session, apiKey);

        LinearLayout linLayout = new LinearLayout(mContext);
        ViewGroup.LayoutParams lpView = new ViewGroup.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        TextView view = new TextView(mContext);
        view.setText("test");
        linLayout.addView(view, lpView);

        textChatFragment.setActionBar(linLayout);

        Assert.assertNotNull(textChatFragment.getActionBar());
    }

    public void testSetActionBarWhenActionBarIsNull() throws Exception {
        try {
            session = new OTAcceleratorSession(context, apiKey, sessionId);
            session.setSessionListener(sessionListener);
            session.connect(token);
            waitSessionConnected();
            textChatFragment = TextChatFragment.newInstance(session, apiKey);
            textChatFragment.setActionBar(null);

            Assert.fail("Should have thrown an exception with a null action bar");

        } catch (Exception e) {
            //Assert.assertNotNull(textChatFragment.getActionBar()); //actionbar by default
        }
    }

    public void testSetSendMessageViewWhenOK() throws Exception {
        session = new OTAcceleratorSession(context, apiKey, sessionId);
        session.setSessionListener(sessionListener);
        session.connect(token);
        waitSessionConnected();
        textChatFragment = TextChatFragment.newInstance(session, apiKey);

        LinearLayout linLayout = new LinearLayout(mContext);
        ViewGroup.LayoutParams lpView = new ViewGroup.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        TextView view = new TextView(mContext);
        view.setText("test");
        linLayout.addView(view, lpView);

        textChatFragment.setSendMessageView(linLayout);

        Assert.assertNotNull(textChatFragment.getSendMessageView());
    }

    public void testSetSendMessageViewWhenSendMessageViewIsNull() throws Exception {
        try {
            session = new OTAcceleratorSession(context, apiKey, sessionId);
            session.setSessionListener(sessionListener);
            session.connect(token);
            waitSessionConnected();
            textChatFragment = TextChatFragment.newInstance(session, apiKey);
            textChatFragment.setSendMessageView(null);

            Assert.fail("Should have thrown an exception with a null send message view area");

        } catch (Exception e) {
            //Assert.assertNotNull(textChatFragment.getSendMessageView()); //actionbar by default
        }
    }

}

